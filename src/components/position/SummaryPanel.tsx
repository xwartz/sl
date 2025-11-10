import { useI18n } from '../../lib/i18n'
import { formatCurrency } from '../../lib/position-calculator'
import type { PositionSummary, PositionConfig } from '../../lib/position-calculator'
import SummaryCard from './SummaryCard'
import PnLAnalysis from './PnLAnalysis'

interface SummaryPanelProps {
  summary: PositionSummary
  config: PositionConfig
  totalStopLossPnL: number
  totalTakeProfitPnL: number
  stopLossRatio: number
}

export default function SummaryPanel({
  summary,
  config,
  totalStopLossPnL,
  totalTakeProfitPnL,
  stopLossRatio,
}: SummaryPanelProps) {
  const { t } = useI18n()

  const capitalStatusItems = [
    {
      label: t("position.summary.capital.total"),
      value: `$${formatCurrency(summary.totalCapital, 2)}`,
      valueClassName: "text-lg font-bold text-accent",
    },
    {
      label: t("position.summary.capital.invested"),
      value: `$${formatCurrency(summary.totalInvestment, 2)}`,
      valueClassName: `text-lg font-semibold ${
        summary.isOverCapital ? "text-danger" : "text-text"
      }`,
    },
    {
      label: t("position.summary.capital.remaining"),
      value: `$${formatCurrency(summary.remainingCapital, 2)}`,
      valueClassName: `text-lg font-semibold ${
        summary.remainingCapital < 0 ? "text-danger" : "text-success"
      }`,
    },
  ]

  const positionInfoItems = [
    {
      label: t("position.summary.position.avg.price"),
      value: `$${formatCurrency(summary.averagePrice, 2)}`,
      valueClassName: "text-lg font-semibold text-text",
    },
    {
      label: t("position.summary.position.total"),
      value: formatCurrency(summary.totalQuantity, 4),
      valueClassName: "text-lg font-semibold text-text",
    },
    {
      label: t("position.summary.position.contract.value"),
      value: `$${formatCurrency(summary.totalContractValue, 2)}`,
      valueClassName: "text-lg font-semibold text-text",
    },
  ]

  const riskIndicatorsItems = [
    {
      label: t("position.summary.risk.liquidation"),
      value: `$${formatCurrency(summary.liquidationPrice, 2)}`,
      valueClassName: "text-lg font-bold text-danger",
    },
    {
      label: t("position.summary.risk.real.leverage"),
      value: `${formatCurrency(summary.realLeverage, 2)}x`,
      valueClassName: `text-lg font-semibold ${
        summary.realLeverage > config.leverage ? "text-danger" : "text-text"
      }`,
    },
    {
      label: t("position.summary.risk.effective.leverage"),
      value: `${formatCurrency(summary.effectiveLeverage, 2)}x`,
      valueClassName: "text-lg font-semibold text-muted",
    },
  ]

  return (
    <div className="bg-card border border-border-var rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-text mb-6">
        {t("position.summary")}
      </h2>

      {/* 核心指标 - 3大卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* 资金状况 */}
        <SummaryCard
          icon="💰"
          title={t("position.summary.capital.status")}
          items={[
            ...capitalStatusItems,
            {
              label: t("position.summary.capital.utilization"),
              value: `${formatCurrency(summary.capitalUtilization, 1)}%`,
              valueClassName: "text-sm font-medium text-text",
            },
          ]}
          warning={{
            show: summary.isOverCapital,
            message: t("position.over.capital"),
          }}
        />

        {/* 持仓信息 */}
        <div className="bg-gradient-to-br from-panel to-panel/50 rounded-xl p-5 border border-border-var">
          <div className="text-sm font-medium text-muted mb-4">
            📊 {t("position.summary.position.info")}
          </div>
          <div className="space-y-3">
            {positionInfoItems.map((item, index) => (
              <div key={index} className="flex justify-between items-baseline">
                <span className="text-xs text-muted">{item.label}</span>
                <span className={item.valueClassName}>{item.value}</span>
              </div>
            ))}
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
        <SummaryCard
          icon="⚠️"
          title={t("position.summary.risk.indicators")}
          items={riskIndicatorsItems}
          warning={{
            show: summary.realLeverage > config.leverage,
            message: t("position.over.leverage"),
          }}
        />
      </div>

      {/* 盈亏分析 */}
      <PnLAnalysis
        totalStopLossPnL={totalStopLossPnL}
        totalTakeProfitPnL={totalTakeProfitPnL}
        stopLossRatio={stopLossRatio}
        riskRewardRatio={summary.riskRewardRatio}
      />
    </div>
  )
}

