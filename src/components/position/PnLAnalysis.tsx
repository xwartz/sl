import { useI18n } from '../../lib/i18n'
import { formatCurrency } from '../../lib/position-calculator'

interface PnLAnalysisProps {
  totalStopLossPnL: number
  totalTakeProfitPnL: number
  stopLossRatio: number
  riskRewardRatio: number
}

export default function PnLAnalysis({
  totalStopLossPnL,
  totalTakeProfitPnL,
  stopLossRatio,
  riskRewardRatio,
}: PnLAnalysisProps) {
  const { t } = useI18n()

  if (totalStopLossPnL === 0 && totalTakeProfitPnL === 0) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-panel/50 to-panel rounded-xl p-5 border border-border-var">
      <div className="text-sm font-medium text-muted mb-4">
        📈 {t("position.summary.pnl.analysis")}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 止损价值 */}
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

        {/* 止损占比 */}
        <div className="flex justify-between items-center p-3 bg-card rounded-lg">
          <span className="text-xs text-muted">
            {t("position.summary.pnl.stop.loss.ratio")}
          </span>
          <span
            className={`text-xl font-bold ${
              stopLossRatio > 0
                ? stopLossRatio > 50
                  ? "text-danger"
                  : stopLossRatio > 20
                  ? "text-warning"
                  : "text-text"
                : "text-muted"
            }`}
          >
            {stopLossRatio > 0 ? `${formatCurrency(stopLossRatio, 1)}%` : "-"}
          </span>
        </div>

        {/* 止盈价值 */}
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

        {/* 盈亏比 */}
        <div className="flex justify-between items-center p-3 bg-card rounded-lg">
          <span className="text-xs text-muted">
            {t("position.summary.pnl.risk.reward")}
          </span>
          <span className="text-xl font-bold text-accent">
            {riskRewardRatio > 0 ? formatCurrency(riskRewardRatio, 2) : "-"}
          </span>
        </div>
      </div>
    </div>
  )
}

