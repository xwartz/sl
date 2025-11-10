import { Plus } from 'lucide-react'
import { useI18n } from '../../lib/i18n'
import OrderTableRow from './OrderTableRow'
import OrderCard from './OrderCard'
import type { OrderEntry, OrderCalculation } from '../../lib/position-calculator'

interface OrderWithCalculation {
  order: OrderEntry
  calculation: OrderCalculation
  stopLossPnL: number
  takeProfitPnL: number
}

interface OrderListProps {
  ordersWithCalculations: OrderWithCalculation[]
  onUpdateOrder: (orderId: string, updates: Partial<OrderEntry>) => void
  onDuplicateOrder: (orderId: string) => void
  onDeleteOrder: (orderId: string) => void
  onAddOrder: () => void
}

export default function OrderList({
  ordersWithCalculations,
  onUpdateOrder,
  onDuplicateOrder,
  onDeleteOrder,
  onAddOrder,
}: OrderListProps) {
  const { t } = useI18n()

  return (
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
              ({ order, calculation, stopLossPnL, takeProfitPnL }, index) => (
                <OrderTableRow
                  key={order.id}
                  order={order}
                  calculation={calculation}
                  stopLossPnL={stopLossPnL}
                  takeProfitPnL={takeProfitPnL}
                  index={index}
                  onUpdateOrder={onUpdateOrder}
                  onDuplicateOrder={onDuplicateOrder}
                  onDeleteOrder={onDeleteOrder}
                />
              )
            )}
          </tbody>
        </table>
      </div>

      {/* 移动端卡片视图 */}
      <div className="lg:hidden p-4 space-y-4">
        {ordersWithCalculations.map(
          ({ order, calculation, stopLossPnL, takeProfitPnL }, index) => (
            <OrderCard
              key={order.id}
              order={order}
              calculation={calculation}
              stopLossPnL={stopLossPnL}
              takeProfitPnL={takeProfitPnL}
              index={index}
              onUpdateOrder={onUpdateOrder}
              onDuplicateOrder={onDuplicateOrder}
              onDeleteOrder={onDeleteOrder}
            />
          )
        )}
      </div>

      {/* 添加订单按钮 */}
      <div className="border-t border-border-var p-4">
        <button
          onClick={onAddOrder}
          className="w-full py-3 border-2 border-dashed border-border-var rounded-lg hover:border-accent hover:bg-panel/50 transition-all text-sm text-muted hover:text-text flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          {t("position.add.order.row")}
        </button>
      </div>
    </div>
  )
}

