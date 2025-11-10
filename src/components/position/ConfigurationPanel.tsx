import { useI18n } from '../../lib/i18n'
import type { PositionConfig } from '../../lib/position-calculator'

interface ConfigurationPanelProps {
  config: PositionConfig
  onConfigChange: (updates: Partial<PositionConfig>) => void
}

export default function ConfigurationPanel({
  config,
  onConfigChange,
}: ConfigurationPanelProps) {
  const { t } = useI18n()

  return (
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
              onClick={() => onConfigChange({ direction: "long" })}
              className={`flex-1 sm:w-[95px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                config.direction === "long"
                  ? "bg-success text-white shadow-sm"
                  : "bg-panel text-muted border border-border-var hover:border-success hover:bg-success/10"
              }`}
            >
              {t("position.long")}
            </button>
            <button
              onClick={() => onConfigChange({ direction: "short" })}
              className={`flex-1 sm:w-[95px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                config.direction === "short"
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
              onClick={() => onConfigChange({ marginMode: "cross" })}
              className={`flex-1 sm:w-[95px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                config.marginMode === "cross"
                  ? "bg-accent text-white shadow-sm"
                  : "bg-panel text-muted border border-border-var hover:border-accent hover:bg-accent/10"
              }`}
            >
              {t("position.cross")}
            </button>
            <button
              onClick={() => onConfigChange({ marginMode: "isolated" })}
              className={`flex-1 sm:w-[95px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                config.marginMode === "isolated"
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
              value={config.totalCapital}
              onChange={(e) =>
                onConfigChange({ totalCapital: Number(e.target.value) })
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
              value={config.leverage}
              onChange={(e) =>
                onConfigChange({ leverage: Number(e.target.value) })
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
              value={config.feeRate}
              onChange={(e) =>
                onConfigChange({ feeRate: Number(e.target.value) })
              }
              className="w-full px-3 py-2 rounded-lg bg-panel border border-border-var text-text text-base font-semibold"
              step="0.01"
              min="0"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

