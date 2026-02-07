import { Copy, Trash2 } from 'lucide-react'
import { useI18n } from '../../lib/i18n'
import { formatCurrency } from '../../lib/position-calculator'
import type {
  OrderEntry,
  OrderCalculation,
} from '../../lib/position-calculator'
import NumberInput from '../NumberInput'

interface OrderCardProps {
  order: OrderEntry
  calculation: OrderCalculation
  stopLossPnL: number
  takeProfitPnL: number
  index: number
  onUpdateOrder: (orderId: string, updates: Partial<OrderEntry>) => void
  onDuplicateOrder: (orderId: string) => void
  onDeleteOrder: (orderId: string) => void
}

export default function OrderCard({
  order,
  calculation,
  stopLossPnL,
  takeProfitPnL,
  index,
  onUpdateOrder,
  onDuplicateOrder,
  onDeleteOrder,
}: OrderCardProps) {
  const { t } = useI18n()

  return (
    <div className="bg-panel rounded-xl p-4 border border-border-var">
      {/* 卡片头部 */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-var">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted">
            {t('position.order.number')} #{index + 1}
          </span>
          <span className="text-sm font-bold text-accent">
            ${formatCurrency(calculation.totalCost, 2)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDuplicateOrder(order.id)}
            className="p-2 hover:bg-card rounded-lg transition-colors"
            title={t('position.duplicate')}
          >
            <Copy size={16} className="text-muted" />
          </button>
          <button
            onClick={() => onDeleteOrder(order.id)}
            className="p-2 hover:bg-danger/10 rounded-lg transition-colors"
            title={t('position.delete')}
          >
            <Trash2 size={16} className="text-danger" />
          </button>
        </div>
      </div>

      {/* 输入字段 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs text-muted mb-1">
            {t('position.unit.price')}
          </label>
          <NumberInput
            value={order.price}
            onChange={(v) => onUpdateOrder(order.id, { price: v ?? 0 })}
            className="w-full px-3 py-2 rounded-lg bg-card border border-border-var text-sm text-text"
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">
            {t('position.quantity')}
          </label>
          <NumberInput
            value={order.quantity}
            onChange={(v) => onUpdateOrder(order.id, { quantity: v ?? 0 })}
            className="w-full px-3 py-2 rounded-lg bg-card border border-border-var text-sm text-text"
            min="0"
            step="0.0001"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">
            {t('position.stop.loss')}
          </label>
          <NumberInput
            value={order.stopLoss}
            onChange={(v) => onUpdateOrder(order.id, { stopLoss: v })}
            allowEmpty
            placeholder="-"
            className="w-full px-3 py-2 rounded-lg bg-card border border-border-var text-sm text-text placeholder:text-muted"
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">
            {t('position.take.profit')}
          </label>
          <NumberInput
            value={order.takeProfit}
            onChange={(v) => onUpdateOrder(order.id, { takeProfit: v })}
            allowEmpty
            placeholder="-"
            className="w-full px-3 py-2 rounded-lg bg-card border border-border-var text-sm text-text placeholder:text-muted"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* 计算结果 */}
      <div className="space-y-2 pt-3 border-t border-border-var">
        {/* 重要指标 */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted">
              {t('position.contract.value.short')}
            </span>
            <span className="font-bold text-text">
              ${formatCurrency(calculation.contractValue, 2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">{t('position.total.cost.short')}</span>
            <span className="font-medium text-accent">
              ${formatCurrency(calculation.totalCost, 2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">
              {t('position.cumulative.investment.short')}
            </span>
            <span className="font-medium text-text">
              ${formatCurrency(calculation.cumulativeInvestment, 2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">
              {t('position.average.price.short')}
            </span>
            <span className="font-medium text-text">
              ${formatCurrency(calculation.averagePrice, 2)}
            </span>
          </div>
        </div>

        {/* 费用明细 (折叠显示) */}
        <div className="text-xs text-muted pt-2 border-t border-border-var/50">
          <div className="flex justify-between">
            <span>
              {t('position.margin.label')}: $
              {formatCurrency(calculation.margin, 2)}
            </span>
            <span>
              {t('position.fee.label')}: ${formatCurrency(calculation.fee, 2)}
            </span>
          </div>
        </div>

        {/* 盈亏显示 */}
        {(order.stopLoss || order.takeProfit) && (
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border-var">
            {order.stopLoss && (
              <div className="flex justify-between">
                <span className="text-muted">
                  {t('position.stop.loss.pnl')}
                </span>
                <span
                  className={`font-bold ${
                    stopLossPnL < 0
                      ? 'text-danger'
                      : stopLossPnL > 0
                        ? 'text-success'
                        : 'text-muted'
                  }`}
                >
                  ${formatCurrency(stopLossPnL, 2)}
                </span>
              </div>
            )}
            {order.takeProfit && (
              <div className="flex justify-between">
                <span className="text-muted">
                  {t('position.take.profit.pnl')}
                </span>
                <span
                  className={`font-bold ${
                    takeProfitPnL > 0
                      ? 'text-success'
                      : takeProfitPnL < 0
                        ? 'text-danger'
                        : 'text-muted'
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
}
