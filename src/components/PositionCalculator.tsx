import { useI18n } from '../lib/i18n'
import {
  type OrderEntry,
  calculateOrder,
  calculatePositionSummary,
  calculateOrderProfitLoss,
} from '../lib/position-calculator'
import { usePositionStore, type PlanTab } from '../store/position-store'
import PlanTabs from './position/PlanTabs'
import ConfigurationPanel from './position/ConfigurationPanel'
import OrderList from './position/OrderList'
import SummaryPanel from './position/SummaryPanel'

export default function PositionCalculator() {
  const { t } = useI18n()

  // 从 Zustand store 获取状态和 actions
  const {
    activePlanId,
    plans,
    editingPlanId,
    editingPlanName,
    setActivePlanId,
    startEditingPlan,
    finishEditingPlan,
    cancelEditingPlan,
    setEditingPlanName,
    addPlan,
    deletePlan,
    updatePlanConfig,
    addOrder,
    updateOrder,
    deleteOrder,
    duplicateOrder,
  } = usePositionStore()

  const activePlan = plans.find((p) => p.id === activePlanId) || plans[0]

  // 添加新计划
  const handleAddPlan = () => {
    const newPlan: PlanTab = {
      id: Date.now().toString(),
      name: `${t('position.new.plan')} ${plans.length + 1}`,
      config: {
        direction: 'long',
        leverage: 10,
        feeRate: 0.05,
        totalCapital: 10000,
        marginMode: 'cross',
      },
      orders: [{ id: '1', price: 100000, quantity: 0.1 }],
    }
    addPlan(newPlan)
  }

  // 添加订单
  const handleAddOrder = () => {
    const lastOrder = activePlan.orders[activePlan.orders.length - 1]
    const defaultPrice = lastOrder ? lastOrder.price : 100000

    const newOrder: OrderEntry = {
      id: Date.now().toString(),
      price: defaultPrice,
      quantity: 0.1,
    }
    addOrder(activePlanId, newOrder)
  }

  // 计算每笔订单的数据
  const ordersWithCalculations = activePlan.orders.map((order, index) => {
    const previousOrders = activePlan.orders.slice(0, index)

    let previousTotalQuantity = 0
    let previousCumulativeInvestment = 0

    previousOrders.forEach((o) => {
      const calc = calculateOrder(
        o,
        previousTotalQuantity,
        previousCumulativeInvestment,
        activePlan.config
      )
      previousTotalQuantity = calc.totalQuantity
      previousCumulativeInvestment = calc.cumulativeInvestment
    })

    const calculation = calculateOrder(
      order,
      previousTotalQuantity,
      previousCumulativeInvestment,
      activePlan.config
    )

    const { stopLossPnL, takeProfitPnL } = calculateOrderProfitLoss(
      calculation.quantity,
      order.price,
      order.stopLoss,
      order.takeProfit,
      activePlan.config.direction
    )

    return {
      order,
      calculation,
      stopLossPnL,
      takeProfitPnL,
    }
  })

  // 计算汇总信息
  const summary = calculatePositionSummary(activePlan.orders, activePlan.config)

  // 计算总的止损止盈
  const totalStopLossPnL = ordersWithCalculations.reduce(
    (sum, item) => sum + item.stopLossPnL,
    0
  )
  const totalTakeProfitPnL = ordersWithCalculations.reduce(
    (sum, item) => sum + item.takeProfitPnL,
    0
  )

  // 计算止损价值占总本金的比例
  const stopLossRatio =
    activePlan.config.totalCapital > 0
      ? Math.abs((totalStopLossPnL / activePlan.config.totalCapital) * 100)
      : 0

  // 计算真实的盈亏比（基于所有订单的实际止损止盈总和）
  const actualRiskRewardRatio =
    Math.abs(totalStopLossPnL) > 0
      ? Math.abs(totalTakeProfitPnL) / Math.abs(totalStopLossPnL)
      : 0

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="container mx-auto max-w-[1600px] px-4 py-8">
        {/* 计划标签页 */}
        <PlanTabs
          plans={plans}
          activePlanId={activePlanId}
          editingPlanId={editingPlanId}
          editingPlanName={editingPlanName}
          onActivePlanChange={setActivePlanId}
          onStartEditingPlan={startEditingPlan}
          onFinishEditingPlan={finishEditingPlan}
          onCancelEditingPlan={cancelEditingPlan}
          onEditingPlanNameChange={setEditingPlanName}
          onDeletePlan={deletePlan}
          onAddPlan={handleAddPlan}
        />

        {/* 配置区域 */}
        <ConfigurationPanel
          config={activePlan.config}
          onConfigChange={(updates) => updatePlanConfig(activePlanId, updates)}
        />

        {/* 订单列表 */}
        <OrderList
          ordersWithCalculations={ordersWithCalculations}
          onUpdateOrder={(orderId, updates) =>
            updateOrder(activePlanId, orderId, updates)
          }
          onDuplicateOrder={(orderId) => duplicateOrder(activePlanId, orderId)}
          onDeleteOrder={(orderId) => deleteOrder(activePlanId, orderId)}
          onAddOrder={handleAddOrder}
        />

        {/* 汇总信息 */}
        <SummaryPanel
          summary={summary}
          config={activePlan.config}
          totalStopLossPnL={totalStopLossPnL}
          totalTakeProfitPnL={totalTakeProfitPnL}
          stopLossRatio={stopLossRatio}
          riskRewardRatio={actualRiskRewardRatio}
        />
      </div>
    </div>
  )
}
