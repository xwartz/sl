import { Copy, Trash2, Plus, Pencil } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import {
  type OrderEntry,
  calculateOrder,
  calculatePositionSummary,
  calculateOrderProfitLoss,
  formatCurrency,
} from '../lib/position-calculator'
import { usePositionStore, type PlanTab } from '../store/position-store'

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

  const activePlan = plans.find(p => p.id === activePlanId) || plans[0]

  // 添加新计划
  const handleAddPlan = () => {
    const newPlan: PlanTab = {
      id: Date.now().toString(),
      name: `${t("position.new.plan")} ${plans.length + 1}`,
      config: {
        direction: "long",
        leverage: 10,
        feeRate: 0.05,
        totalCapital: 10000,
        marginMode: "cross", // 默认全仓模式
      },
      orders: [{ id: "1", price: 100000, quantity: 0.1 }],
    }
    addPlan(newPlan)
  }

  // 添加订单
  const handleAddOrder = () => {
    // 使用最后一笔订单的价格作为默认值，如果没有订单则使用100000
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

    // 计算该订单的止损止盈
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

  // 计算总的止损止盈（所有订单的加总）
  const totalStopLossPnL = ordersWithCalculations.reduce(
    (sum, item) => sum + item.stopLossPnL,
    0
  )
  const totalTakeProfitPnL = ordersWithCalculations.reduce(
    (sum, item) => sum + item.takeProfitPnL,
    0
  )

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="container mx-auto max-w-[1600px] px-4 py-8">
        {/* 计划标签页 */}
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 border border-border-var rounded-lg p-1 bg-panel overflow-x-auto">
            {plans.map((plan) => (
              <div key={plan.id} className="relative group">
                {editingPlanId === plan.id ? (
                  <div className="flex items-center gap-1 px-2 py-1 bg-card rounded-md">
                    <input
                      type="text"
                      value={editingPlanName}
                      onChange={(e) => setEditingPlanName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") finishEditingPlan()
                        if (e.key === "Escape") cancelEditingPlan()
                      }}
                      onBlur={finishEditingPlan}
                      className="w-32 px-2 py-1 text-sm bg-panel border border-border-var rounded text-text focus:outline-none focus:border-accent"
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActivePlanId(plan.id)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                        activePlanId === plan.id
                          ? "bg-card shadow-sm text-text"
                          : "text-muted hover:text-text"
                      }`}
                    >
                      {plan.name}
                    </button>
                    {activePlanId === plan.id && (
                      <button
                        onClick={() => startEditingPlan(plan.id, plan.name)}
                        className="p-1.5 hover:bg-panel rounded transition-colors opacity-0 group-hover:opacity-100"
                        title={t("position.rename")}
                      >
                        <Pencil size={14} className="text-muted" />
                      </button>
                    )}
                    {plans.length > 1 && (
                      <button
                        onClick={() => deletePlan(plan.id)}
                        className="p-1.5 hover:bg-danger/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title={t("position.delete")}
                      >
                        <Trash2 size={14} className="text-danger" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={handleAddPlan}
            className="px-4 py-2 border border-border-var rounded-lg hover:bg-panel transition-colors text-sm text-muted hover:text-text"
          >
            + {t("position.new.tab")}
          </button>
        </div>

        {/* 配置区域 */}
        <div className="bg-card border border-border-var rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text mb-4">
            {t("position.config")}
          </h2>

          <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
            {/* 方向 */}
            <div className="w-full sm:w-auto sm:min-w-[200px]">
              <label className="block text-sm font-medium text-text mb-2">
                {t("position.direction")}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    updatePlanConfig(activePlanId, { direction: "long" })
                  }
                  className={`flex-1 sm:w-[95px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activePlan.config.direction === "long"
                      ? "bg-success text-white shadow-sm"
                      : "bg-panel text-muted border border-border-var hover:border-success hover:bg-success/10"
                  }`}
                >
                  {t("position.long")}
                </button>
                <button
                  onClick={() =>
                    updatePlanConfig(activePlanId, { direction: "short" })
                  }
                  className={`flex-1 sm:w-[95px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activePlan.config.direction === "short"
                      ? "bg-danger text-white shadow-sm"
                      : "bg-panel text-muted border border-border-var hover:border-danger hover:bg-danger/10"
                  }`}
                >
                  {t("position.short")}
                </button>
              </div>
            </div>

            {/* 保证金模式 */}
            <div className="w-full sm:w-auto sm:min-w-[200px]">
              <label className="block text-sm font-medium text-text mb-2">
                {t("position.margin.mode")}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    updatePlanConfig(activePlanId, { marginMode: "cross" })
                  }
                  className={`flex-1 sm:w-[95px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activePlan.config.marginMode === "cross"
                      ? "bg-accent text-white shadow-sm"
                      : "bg-panel text-muted border border-border-var hover:border-accent hover:bg-accent/10"
                  }`}
                >
                  {t("position.cross")}
                </button>
                <button
                  onClick={() =>
                    updatePlanConfig(activePlanId, { marginMode: "isolated" })
                  }
                  className={`flex-1 sm:w-[95px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activePlan.config.marginMode === "isolated"
                      ? "bg-accent text-white shadow-sm"
                      : "bg-panel text-muted border border-border-var hover:border-accent hover:bg-accent/10"
                  }`}
                >
                  {t("position.isolated")}
                </button>
              </div>
            </div>

            {/* 总本金 */}
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-text mb-2">
                $ {t("position.total.capital")}
              </label>
              <div className="relative w-full sm:w-[180px]">
                <input
                  type="number"
                  value={activePlan.config.totalCapital}
                  onChange={(e) =>
                    updatePlanConfig(activePlanId, {
                      totalCapital: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-panel border-2 border-accent/20 text-text text-base font-bold focus:border-accent"
                  min="0"
                />
              </div>
            </div>

            {/* 杠杆倍数 */}
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-text mb-2">
                x {t("position.leverage")}
              </label>
              <div className="relative w-full sm:w-[120px]">
                <input
                  type="number"
                  value={activePlan.config.leverage}
                  onChange={(e) =>
                    updatePlanConfig(activePlanId, {
                      leverage: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-panel border border-border-var text-text text-base font-semibold"
                  min="1"
                  max="125"
                />
              </div>
            </div>

            {/* 费率 */}
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-text mb-2">
                % {t("position.fee.rate")}
              </label>
              <div className="relative w-full sm:w-[120px]">
                <input
                  type="number"
                  value={activePlan.config.feeRate}
                  onChange={(e) =>
                    updatePlanConfig(activePlanId, {
                      feeRate: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-panel border border-border-var text-text text-base font-semibold"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 订单列表 */}
        <div className="bg-card border border-border-var rounded-xl shadow-sm overflow-hidden mb-6">
          {/* 桌面端表格视图 */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-var bg-panel">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider whitespace-nowrap">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider whitespace-nowrap">
                    {t("position.unit.price")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider whitespace-nowrap">
                    {t("position.quantity")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider whitespace-nowrap">
                    {t("position.stop.loss")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider whitespace-nowrap">
                    {t("position.take.profit")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider whitespace-nowrap">
                    {t("position.contract.value.single")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider whitespace-nowrap">
                    {t("position.total.cost")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider whitespace-nowrap">
                    {t("position.cumulative.investment")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider whitespace-nowrap">
                    {t("position.average.price")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider whitespace-nowrap">
                    {t("position.stop.loss.value")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider whitespace-nowrap">
                    {t("position.take.profit.value")}
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted uppercase tracking-wider whitespace-nowrap">
                    {t("position.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {ordersWithCalculations.map(
                  (
                    { order, calculation, stopLossPnL, takeProfitPnL },
                    index
                  ) => (
                    <tr
                      key={order.id}
                      className="border-b border-border-var hover:bg-panel/50 transition-colors"
                    >
                      {/* # 序号 */}
                      <td className="px-4 py-3 text-sm text-text">
                        {index + 1}
                      </td>

                      {/* 挂单价格 */}
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={order.price}
                          onChange={(e) =>
                            updateOrder(activePlanId, order.id, {
                              price: Number(e.target.value),
                            })
                          }
                          className="w-28 px-3 py-2 rounded-lg bg-panel border border-border-var text-sm text-text"
                          min="0"
                        />
                      </td>

                      {/* 购买数量 */}
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={order.quantity}
                          onChange={(e) =>
                            updateOrder(activePlanId, order.id, {
                              quantity: Number(e.target.value),
                            })
                          }
                          className="w-28 px-3 py-2 rounded-lg bg-panel border border-border-var text-sm text-text"
                          min="0"
                          step="0.0001"
                        />
                      </td>

                      {/* 止损价 */}
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={order.stopLoss || ""}
                          onChange={(e) =>
                            updateOrder(activePlanId, order.id, {
                              stopLoss: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            })
                          }
                          placeholder="-"
                          className="w-28 px-3 py-2 rounded-lg bg-panel border border-border-var text-sm text-text placeholder:text-muted"
                          min="0"
                        />
                      </td>

                      {/* 止盈价 */}
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={order.takeProfit || ""}
                          onChange={(e) =>
                            updateOrder(activePlanId, order.id, {
                              takeProfit: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            })
                          }
                          placeholder="-"
                          className="w-28 px-3 py-2 rounded-lg bg-panel border border-border-var text-sm text-text placeholder:text-muted"
                          min="0"
                        />
                      </td>

                      {/* 合约价值 */}
                      <td className="px-4 py-3 text-sm text-text whitespace-nowrap font-semibold">
                        ${formatCurrency(calculation.contractValue, 2)}
                      </td>

                      {/* 实际投入 (带 tooltip) */}
                      <td className="px-4 py-3 text-sm text-text whitespace-nowrap">
                        <span
                          className="font-medium cursor-help"
                          title={`保证金: $${formatCurrency(
                            calculation.margin,
                            2
                          )} + 手续费: $${formatCurrency(calculation.fee, 2)}`}
                        >
                          ${formatCurrency(calculation.totalCost, 2)}
                        </span>
                      </td>

                      {/* 累计投资 */}
                      <td className="px-4 py-3 text-sm text-text whitespace-nowrap">
                        ${formatCurrency(calculation.cumulativeInvestment, 2)}
                      </td>

                      {/* 平均价 */}
                      <td className="px-4 py-3 text-sm text-text whitespace-nowrap">
                        ${formatCurrency(calculation.averagePrice, 2)}
                      </td>

                      {/* 止损盈亏 */}
                      <td
                        className={`px-4 py-3 text-sm whitespace-nowrap font-medium ${
                          stopLossPnL < 0
                            ? "text-danger"
                            : stopLossPnL > 0
                            ? "text-success"
                            : "text-muted"
                        }`}
                      >
                        {order.stopLoss
                          ? `$${formatCurrency(stopLossPnL, 2)}`
                          : "-"}
                      </td>

                      {/* 止盈盈亏 */}
                      <td
                        className={`px-4 py-3 text-sm whitespace-nowrap font-medium ${
                          takeProfitPnL > 0
                            ? "text-success"
                            : takeProfitPnL < 0
                            ? "text-danger"
                            : "text-muted"
                        }`}
                      >
                        {order.takeProfit
                          ? `$${formatCurrency(takeProfitPnL, 2)}`
                          : "-"}
                      </td>

                      {/* 操作 */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              duplicateOrder(activePlanId, order.id)
                            }
                            className="p-2 hover:bg-panel rounded-lg transition-colors"
                            title={t("position.duplicate")}
                          >
                            <Copy
                              size={16}
                              className="text-muted hover:text-text"
                            />
                          </button>
                          <button
                            onClick={() => deleteOrder(activePlanId, order.id)}
                            className="p-2 hover:bg-danger/10 rounded-lg transition-colors"
                            title={t("position.delete")}
                          >
                            <Trash2 size={16} className="text-danger" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* 移动端卡片视图 */}
          <div className="lg:hidden p-4 space-y-4">
            {ordersWithCalculations.map(
              ({ order, calculation, stopLossPnL, takeProfitPnL }, index) => (
                <div
                  key={order.id}
                  className="bg-panel rounded-xl p-4 border border-border-var"
                >
                  {/* 卡片头部 */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-var">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted">
                        订单 #{index + 1}
                      </span>
                      <span className="text-sm font-bold text-accent">
                        ${formatCurrency(calculation.totalCost, 2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => duplicateOrder(activePlanId, order.id)}
                        className="p-2 hover:bg-card rounded-lg transition-colors"
                        title={t("position.duplicate")}
                      >
                        <Copy size={16} className="text-muted" />
                      </button>
                      <button
                        onClick={() => deleteOrder(activePlanId, order.id)}
                        className="p-2 hover:bg-danger/10 rounded-lg transition-colors"
                        title={t("position.delete")}
                      >
                        <Trash2 size={16} className="text-danger" />
                      </button>
                    </div>
                  </div>

                  {/* 输入字段 */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-xs text-muted mb-1">
                        {t("position.unit.price")}
                      </label>
                      <input
                        type="number"
                        value={order.price}
                        onChange={(e) =>
                          updateOrder(activePlanId, order.id, {
                            price: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border-var text-sm text-text"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted mb-1">
                        {t("position.quantity")}
                      </label>
                      <input
                        type="number"
                        value={order.quantity}
                        onChange={(e) =>
                          updateOrder(activePlanId, order.id, {
                            quantity: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border-var text-sm text-text"
                        min="0"
                        step="0.0001"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted mb-1">
                        {t("position.stop.loss")}
                      </label>
                      <input
                        type="number"
                        value={order.stopLoss || ""}
                        onChange={(e) =>
                          updateOrder(activePlanId, order.id, {
                            stopLoss: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                        placeholder="-"
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border-var text-sm text-text placeholder:text-muted"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted mb-1">
                        {t("position.take.profit")}
                      </label>
                      <input
                        type="number"
                        value={order.takeProfit || ""}
                        onChange={(e) =>
                          updateOrder(activePlanId, order.id, {
                            takeProfit: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                        placeholder="-"
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border-var text-sm text-text placeholder:text-muted"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* 计算结果 */}
                  <div className="space-y-2 pt-3 border-t border-border-var">
                    {/* 重要指标 */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted">合约价值</span>
                        <span className="font-bold text-text">
                          ${formatCurrency(calculation.contractValue, 2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">实际投入</span>
                        <span className="font-medium text-accent">
                          ${formatCurrency(calculation.totalCost, 2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">累计投资</span>
                        <span className="font-medium text-text">
                          ${formatCurrency(calculation.cumulativeInvestment, 2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">平均价</span>
                        <span className="font-medium text-text">
                          ${formatCurrency(calculation.averagePrice, 2)}
                        </span>
                      </div>
                    </div>

                    {/* 费用明细 (折叠显示) */}
                    <div className="text-xs text-muted pt-2 border-t border-border-var/50">
                      <div className="flex justify-between">
                        <span>
                          保证金: ${formatCurrency(calculation.margin, 2)}
                        </span>
                        <span>
                          手续费: ${formatCurrency(calculation.fee, 2)}
                        </span>
                      </div>
                    </div>

                    {/* 盈亏显示 */}
                    {(order.stopLoss || order.takeProfit) && (
                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border-var">
                        {order.stopLoss && (
                          <div className="flex justify-between">
                            <span className="text-muted">止损盈亏</span>
                            <span
                              className={`font-bold ${
                                stopLossPnL < 0
                                  ? "text-danger"
                                  : stopLossPnL > 0
                                  ? "text-success"
                                  : "text-muted"
                              }`}
                            >
                              ${formatCurrency(stopLossPnL, 2)}
                            </span>
                          </div>
                        )}
                        {order.takeProfit && (
                          <div className="flex justify-between">
                            <span className="text-muted">止盈盈亏</span>
                            <span
                              className={`font-bold ${
                                takeProfitPnL > 0
                                  ? "text-success"
                                  : takeProfitPnL < 0
                                  ? "text-danger"
                                  : "text-muted"
                              }`}
                            >
                              ${formatCurrency(takeProfitPnL, 2)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>

          {/* 添加订单按钮 */}
          <div className="border-t border-border-var p-4">
            <button
              onClick={handleAddOrder}
              className="w-full py-3 border-2 border-dashed border-border-var rounded-lg hover:border-accent hover:bg-panel/50 transition-all text-sm text-muted hover:text-text flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              {t("position.add.order.row")}
            </button>
          </div>
        </div>

        {/* 汇总信息 */}
        <div className="bg-card border border-border-var rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text mb-6">
            {t("position.summary")}
          </h2>

          {/* 核心指标 - 3大卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* 资金状况 */}
            <div className="bg-gradient-to-br from-panel to-panel/50 rounded-xl p-5 border border-border-var">
              <div className="text-sm font-medium text-muted mb-4">
                💰 {t("position.summary.capital.status")}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-muted">
                    {t("position.summary.capital.total")}
                  </span>
                  <span className="text-lg font-bold text-accent">
                    ${formatCurrency(summary.totalCapital, 2)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-muted">
                    {t("position.summary.capital.invested")}
                  </span>
                  <span
                    className={`text-lg font-semibold ${
                      summary.isOverCapital ? "text-danger" : "text-text"
                    }`}
                  >
                    ${formatCurrency(summary.totalInvestment, 2)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-muted">
                    {t("position.summary.capital.remaining")}
                  </span>
                  <span
                    className={`text-lg font-semibold ${
                      summary.remainingCapital < 0
                        ? "text-danger"
                        : "text-success"
                    }`}
                  >
                    ${formatCurrency(summary.remainingCapital, 2)}
                  </span>
                </div>
                <div className="pt-2 border-t border-border-var">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted">
                      {t("position.summary.capital.utilization")}
                    </span>
                    <span className="text-sm font-medium text-text">
                      {formatCurrency(summary.capitalUtilization, 1)}%
                    </span>
                  </div>
                </div>
                {summary.isOverCapital && (
                  <div className="text-xs text-danger bg-danger/10 px-2 py-1 rounded">
                    ⚠️ {t("position.over.capital")}
                  </div>
                )}
              </div>
            </div>

            {/* 持仓信息 */}
            <div className="bg-gradient-to-br from-panel to-panel/50 rounded-xl p-5 border border-border-var">
              <div className="text-sm font-medium text-muted mb-4">
                📊 {t("position.summary.position.info")}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-muted">
                    {t("position.summary.position.avg.price")}
                  </span>
                  <span className="text-lg font-semibold text-text">
                    ${formatCurrency(summary.averagePrice, 2)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-muted">
                    {t("position.summary.position.total")}
                  </span>
                  <span className="text-lg font-semibold text-text">
                    {formatCurrency(summary.totalQuantity, 4)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-muted">
                    {t("position.summary.position.contract.value")}
                  </span>
                  <span className="text-lg font-semibold text-text">
                    ${formatCurrency(summary.totalContractValue, 2)}
                  </span>
                </div>
                <div className="pt-2 border-t border-border-var">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted">
                      {t("position.summary.position.margin")}
                    </span>
                    <span className="text-sm font-medium text-text">
                      ${formatCurrency(summary.totalMargin, 2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-muted">
                      {t("position.summary.position.fees")}
                    </span>
                    <span className="text-sm font-medium text-warning">
                      ${formatCurrency(summary.totalFees, 2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 风险指标 */}
            <div className="bg-gradient-to-br from-panel to-panel/50 rounded-xl p-5 border border-border-var">
              <div className="text-sm font-medium text-muted mb-4">
                ⚠️ {t("position.summary.risk.indicators")}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-muted">
                    {t("position.summary.risk.liquidation")}
                  </span>
                  <span className="text-lg font-bold text-danger">
                    ${formatCurrency(summary.liquidationPrice, 2)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-muted">
                    {t("position.summary.risk.real.leverage")}
                  </span>
                  <span
                    className={`text-lg font-semibold ${
                      summary.realLeverage > activePlan.config.leverage
                        ? "text-danger"
                        : "text-text"
                    }`}
                  >
                    {formatCurrency(summary.realLeverage, 2)}x
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-muted">
                    {t("position.summary.risk.effective.leverage")}
                  </span>
                  <span className="text-lg font-semibold text-muted">
                    {formatCurrency(summary.effectiveLeverage, 2)}x
                  </span>
                </div>
                {summary.realLeverage > activePlan.config.leverage && (
                  <div className="text-xs text-danger bg-danger/10 px-2 py-1 rounded">
                    ⚠️ {t("position.over.leverage")}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 盈亏分析 - 仅在有止损/止盈时显示 */}
          {(totalStopLossPnL !== 0 || totalTakeProfitPnL !== 0) && (
            <div className="bg-gradient-to-br from-panel/50 to-panel rounded-xl p-5 border border-border-var">
              <div className="text-sm font-medium text-muted mb-4">
                📈 {t("position.summary.pnl.analysis")}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex justify-between items-center p-3 bg-card rounded-lg">
                  <span className="text-xs text-muted">
                    {t("position.summary.pnl.stop.loss")}
                  </span>
                  <span
                    className={`text-xl font-bold ${
                      totalStopLossPnL < 0
                        ? "text-danger"
                        : totalStopLossPnL > 0
                        ? "text-success"
                        : "text-muted"
                    }`}
                  >
                    {totalStopLossPnL !== 0
                      ? `$${formatCurrency(totalStopLossPnL, 2)}`
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-card rounded-lg">
                  <span className="text-xs text-muted">
                    {t("position.summary.pnl.take.profit")}
                  </span>
                  <span
                    className={`text-xl font-bold ${
                      totalTakeProfitPnL > 0
                        ? "text-success"
                        : totalTakeProfitPnL < 0
                        ? "text-danger"
                        : "text-muted"
                    }`}
                  >
                    {totalTakeProfitPnL !== 0
                      ? `$${formatCurrency(totalTakeProfitPnL, 2)}`
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-card rounded-lg">
                  <span className="text-xs text-muted">
                    {t("position.summary.pnl.risk.reward")}
                  </span>
                  <span className="text-xl font-bold text-accent">
                    {summary.riskRewardRatio > 0
                      ? formatCurrency(summary.riskRewardRatio, 2)
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
