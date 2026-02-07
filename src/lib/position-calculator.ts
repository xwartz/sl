/**
 * 交易仓位计算工具
 * Position Calculator for Trading
 */

export type PositionDirection = 'long' | 'short'
export type MarginMode = 'cross' | 'isolated' // 全仓 | 逐仓
export type TradingMode = 'spot' | 'futures' // 现货 | 合约

export interface OrderEntry {
  id: string
  price: number
  quantity: number // 购买数量 / Quantity
  stopLoss?: number
  takeProfit?: number
}

export interface PositionConfig {
  direction: PositionDirection
  leverage: number
  feeRate: number // 费率 (%)
  totalCapital: number // 总本金
  marginMode: MarginMode // 保证金模式（全仓/逐仓）
  tradingMode: TradingMode // 交易模式（现货/合约）
}

export interface OrderCalculation {
  quantity: number // 购买数量（就是输入的数量）
  contractValue: number // 合约价值
  margin: number // 需要保证金
  fee: number // 手续费
  totalCost: number // 实际投入（保证金+手续费）
  cumulativeInvestment: number // 累计投资
  averagePrice: number // 平均价
  totalQuantity: number // 总持仓数量
  totalContractValue: number // 累计合约/持仓价值
}

export interface PositionSummary {
  totalCapital: number // 总本金
  totalInvestment: number // 总投入（保证金+手续费）
  remainingCapital: number // 剩余本金
  capitalUtilization: number // 本金使用率 (%)
  isOverCapital: boolean // 是否超出本金
  totalMargin: number // 总保证金
  totalContractValue: number // 合约总价值
  averagePrice: number // 平均持仓价
  liquidationPrice: number // 爆仓价
  totalQuantity: number // 总持仓数量
  realLeverage: number // 真实杠杆倍数 = 合约价值 / 总本金
  effectiveLeverage: number // 有效杠杆倍数 = 合约价值 / 实际投入
  totalFees: number // 总手续费

  // 止盈止损相关
  profitLossOnStopLoss: number // 止损时的盈亏
  profitLossOnTakeProfit: number // 止盈时的盈亏
  riskRewardRatio: number // 盈亏比
}

/**
 * 计算单笔订单
 *
 * 逻辑：
 * 1. 用户输入：价格 + 购买数量
 * 2. 计算合约价值 = 价格 × 数量
 * 3. 计算需要保证金 = 合约价值 ÷ 杠杆
 * 4. 计算手续费 = 合约价值 × 费率
 * 5. 实际投入 = 保证金 + 手续费
 */
export function calculateOrder(
  order: OrderEntry,
  previousTotalQuantity: number,
  previousCumulativeInvestment: number,
  previousTotalContractValue: number,
  config: PositionConfig
): OrderCalculation {
  // 现货模式下杠杆固定为 1
  const leverage =
    (config.tradingMode ?? 'futures') === 'spot' ? 1 : config.leverage
  const { feeRate } = config

  // 购买数量（直接使用输入的数量）
  const quantity = order.quantity

  // 合约/持仓价值 = 价格 × 数量
  const contractValue = order.price * quantity

  // 需要保证金 = 合约价值 ÷ 杠杆（现货模式下杠杆=1，即全额支付）
  const margin = contractValue / leverage

  // 手续费 = 合约价值 × 费率%
  const fee = (contractValue * feeRate) / 100

  // 实际投入本金 = 保证金 + 手续费
  const totalCost = margin + fee

  // 累计投资
  const cumulativeInvestment = previousCumulativeInvestment + totalCost

  // 总持仓数量
  const totalQuantity = previousTotalQuantity + quantity

  // 累计持仓价值
  const totalContractValue = previousTotalContractValue + contractValue

  // 平均价 = 累计持仓价值 / 总持仓量（加权平均，不含手续费）
  const averagePrice =
    totalQuantity > 0 ? totalContractValue / totalQuantity : 0

  return {
    quantity,
    contractValue,
    margin,
    fee,
    totalCost,
    cumulativeInvestment,
    averagePrice,
    totalQuantity,
    totalContractValue,
  }
}

/**
 * 计算爆仓价
 * @param averagePrice 平均持仓价
 * @param direction 方向（做多/做空）
 * @param marginMode 保证金模式（全仓/逐仓）
 * @param totalCapital 总本金
 * @param totalMargin 总保证金
 * @param totalQuantity 总持仓数量
 */
export function calculateLiquidationPrice(
  averagePrice: number,
  direction: PositionDirection,
  marginMode: MarginMode,
  totalCapital: number,
  totalMargin: number,
  totalQuantity: number,
  totalFees: number = 0
): number {
  if (totalQuantity === 0) {
    return 0
  }

  // 确定最大可承受亏损
  // 全仓模式：总本金扣除已支付手续费后的余额（手续费已从账户扣除）
  // 逐仓模式：只能亏损当前仓位的保证金
  const maxLoss =
    marginMode === 'cross' ? totalCapital - totalFees : totalMargin

  if (maxLoss <= 0) {
    return 0
  }

  if (direction === 'long') {
    // 做多爆仓价：当价格下跌导致亏损 = 最大可承受亏损时
    // 爆仓价 = 平均价 - 最大可承受亏损 / 数量
    const liqPrice = averagePrice - maxLoss / totalQuantity
    return Math.max(0, liqPrice)
  } else {
    // 做空爆仓价：当价格上涨导致亏损 = 最大可承受亏损时
    // 爆仓价 = 平均价 + 最大可承受亏损 / 数量
    return averagePrice + maxLoss / totalQuantity
  }
}

/**
 * 计算盈亏
 */
export function calculateProfitLoss(
  entryPrice: number,
  exitPrice: number,
  shares: number,
  direction: PositionDirection
): number {
  const priceChange = exitPrice - entryPrice
  const pnl =
    direction === 'long' ? priceChange * shares : -priceChange * shares

  return pnl
}

/**
 * 计算仓位汇总信息
 */
export function calculatePositionSummary(
  orders: OrderEntry[],
  config: PositionConfig
): PositionSummary {
  let totalInvestment = 0
  let totalMargin = 0
  let totalQuantity = 0
  let totalFees = 0
  let cumulativeInvestment = 0
  let totalContractValueAccum = 0
  let averagePrice = 0

  // 计算所有订单
  orders.forEach((order) => {
    const calculation = calculateOrder(
      order,
      totalQuantity,
      cumulativeInvestment,
      totalContractValueAccum,
      config
    )

    totalQuantity = calculation.totalQuantity
    cumulativeInvestment = calculation.cumulativeInvestment
    totalContractValueAccum = calculation.totalContractValue
    averagePrice = calculation.averagePrice
    totalMargin += calculation.margin
    totalFees += calculation.fee
  })

  totalInvestment = cumulativeInvestment
  const isSpot = (config.tradingMode ?? 'futures') === 'spot'
  const totalContractValue = totalContractValueAccum

  // 总本金相关计算
  const totalCapital = config.totalCapital
  const remainingCapital = totalCapital - totalInvestment
  const capitalUtilization =
    totalCapital > 0 ? (totalInvestment / totalCapital) * 100 : 0
  const isOverCapital = totalInvestment > totalCapital

  // 计算爆仓价（现货模式不计算爆仓价）
  const liquidationPrice =
    !isSpot && totalQuantity > 0
      ? calculateLiquidationPrice(
          averagePrice,
          config.direction,
          config.marginMode,
          totalCapital,
          totalMargin,
          totalQuantity,
          totalFees
        )
      : 0

  // 真实杠杆倍数 = 合约总价值 / 总本金（这是用户设定的本金）
  const realLeverage = totalCapital > 0 ? totalContractValue / totalCapital : 0

  // 有效杠杆倍数 = 合约总价值 / 实际投入（这是实际使用的保证金）
  const effectiveLeverage =
    totalInvestment > 0 ? totalContractValue / totalInvestment : 0

  // 找到止损价和止盈价（使用第一个有效的）
  const stopLoss = orders.find((o) => o.stopLoss)?.stopLoss || 0
  const takeProfit = orders.find((o) => o.takeProfit)?.takeProfit || 0

  // 计算止损和止盈时的盈亏
  const profitLossOnStopLoss =
    stopLoss > 0 && totalQuantity > 0
      ? calculateProfitLoss(
          averagePrice,
          stopLoss,
          totalQuantity,
          config.direction
        )
      : 0

  const profitLossOnTakeProfit =
    takeProfit > 0 && totalQuantity > 0
      ? calculateProfitLoss(
          averagePrice,
          takeProfit,
          totalQuantity,
          config.direction
        )
      : 0

  // 盈亏比 = |止盈盈利| / |止损亏损|
  const riskRewardRatio =
    Math.abs(profitLossOnStopLoss) > 0
      ? Math.abs(profitLossOnTakeProfit) / Math.abs(profitLossOnStopLoss)
      : 0

  return {
    totalCapital,
    totalInvestment,
    remainingCapital,
    capitalUtilization,
    isOverCapital,
    totalMargin,
    totalContractValue,
    averagePrice,
    liquidationPrice,
    totalQuantity,
    realLeverage,
    effectiveLeverage,
    totalFees,
    profitLossOnStopLoss,
    profitLossOnTakeProfit,
    riskRewardRatio,
  }
}

/**
 * 格式化货币（添加千位分隔符）
 */
export function formatCurrency(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * 格式化百分比
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * 计算单笔订单的止损止盈
 */
export function calculateOrderProfitLoss(
  quantity: number,
  entryPrice: number,
  stopLoss: number | undefined,
  takeProfit: number | undefined,
  direction: PositionDirection
): { stopLossPnL: number; takeProfitPnL: number } {
  const stopLossPnL = stopLoss
    ? calculateProfitLoss(entryPrice, stopLoss, quantity, direction)
    : 0

  const takeProfitPnL = takeProfit
    ? calculateProfitLoss(entryPrice, takeProfit, quantity, direction)
    : 0

  return { stopLossPnL, takeProfitPnL }
}
