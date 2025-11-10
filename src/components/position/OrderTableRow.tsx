import { Copy, Trash2 } from 'lucide-react'
import { useI18n } from '../../lib/i18n'
import { formatCurrency } from '../../lib/position-calculator'
import type { OrderEntry, OrderCalculation } from '../../lib/position-calculator'

interface OrderTableRowProps {
  order: OrderEntry
  calculation: OrderCalculation
  stopLossPnL: number
  takeProfitPnL: number
  index: number
  onUpdateOrder: (orderId: string, updates: Partial<OrderEntry>) => void
  onDuplicateOrder: (orderId: string) => void
  onDeleteOrder: (orderId: string) => void
}

export default function OrderTableRow({
  order,
  calculation,
  stopLossPnL,
  takeProfitPnL,
  index,
  onUpdateOrder,
  onDuplicateOrder,
  onDeleteOrder,
}: OrderTableRowProps) {
  const { t } = useI18n()

  return (
    <tr className="border-b border-border-var hover:bg-panel/50 transition-colors">
      {/* # 序号 */}
      <td className="px-4 py-3 text-sm text-text">{index + 1}</td>

      {/* 挂单价格 */}
      <td className="px-4 py-3">
        <input
          type="number"
          value={order.price}
          onChange={(e) =>
            onUpdateOrder(order.id, { price: Number(e.target.value) })
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
            onUpdateOrder(order.id, { quantity: Number(e.target.value) })
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
            onUpdateOrder(order.id, {
              stopLoss: e.target.value ? Number(e.target.value) : undefined,
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
            onUpdateOrder(order.id, {
              takeProfit: e.target.value ? Number(e.target.value) : undefined,
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
          title={`${t("position.margin.label")}: $${formatCurrency(
            calculation.margin,
            2
          )} + ${t("position.fee.label")}: $${formatCurrency(calculation.fee, 2)}`}
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
        {order.stopLoss ? `$${formatCurrency(stopLossPnL, 2)}` : "-"}
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
        {order.takeProfit ? `$${formatCurrency(takeProfitPnL, 2)}` : "-"}
      </td>

      {/* 操作 */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onDuplicateOrder(order.id)}
            className="p-2 hover:bg-panel rounded-lg transition-colors"
            title={t("position.duplicate")}
          >
            <Copy size={16} className="text-muted hover:text-text" />
          </button>
          <button
            onClick={() => onDeleteOrder(order.id)}
            className="p-2 hover:bg-danger/10 rounded-lg transition-colors"
            title={t("position.delete")}
          >
            <Trash2 size={16} className="text-danger" />
          </button>
        </div>
      </td>
    </tr>
  )
}

