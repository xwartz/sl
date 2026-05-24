import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../../lib/i18n'
import type { PositionConfig } from '../../lib/position-calculator'
import NumberInput from '../NumberInput'

interface ConfigurationPanelProps {
  config: PositionConfig
  onConfigChange: (updates: Partial<PositionConfig>) => void
}

const LEVERAGE_PRESETS = [1, 2, 3, 5, 10, 20, 50, 100, 125]

/* ── Segmented toggle button ─────────────────────────────── */
function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string; activeClass?: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="inline-flex rounded-lg bg-panel p-0.5 gap-0.5">
      {options.map(opt => {
        const isActive = value === opt.value
        const activeClass =
          opt.activeClass ?? 'bg-accent text-accent-text shadow-sm'
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`interactive-row whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
              isActive ? activeClass : 'text-muted hover:text-text'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export default function ConfigurationPanel({
  config,
  onConfigChange,
}: ConfigurationPanelProps) {
  const { t } = useI18n()
  const [showMore, setShowMore] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const totalCapitalInputId = 'position-total-capital'
  const leverageInputId = 'position-leverage'
  const feeRateInputId = 'position-fee-rate'

  const isSpot = (config.tradingMode ?? 'futures') === 'spot'

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowMore(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Only show the first few presets inline; the rest go into "more"
  const visiblePresets = LEVERAGE_PRESETS.filter(v => v <= 10)
  const hiddenPresets = LEVERAGE_PRESETS.filter(v => v > 10)

  return (
    <div className="bg-card border border-border-var rounded-xl p-4 sm:p-5 mb-5 shadow-sm">
      {/* Row 1: Toggle controls */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted">
            {t('position.trading.mode')}
          </span>
          <SegmentedControl
            value={config.tradingMode ?? 'futures'}
            options={[
              { value: 'futures', label: t('position.futures') },
              { value: 'spot', label: t('position.spot') },
            ]}
            onChange={v => onConfigChange({ tradingMode: v })}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted">
            {t('position.direction')}
          </span>
          <SegmentedControl
            value={config.direction}
            options={[
              {
                value: 'long',
                label: t('position.long'),
                activeClass: 'bg-success text-accent-text shadow-sm',
              },
              {
                value: 'short',
                label: t('position.short'),
                activeClass: 'bg-danger text-accent-text shadow-sm',
              },
            ]}
            onChange={v => onConfigChange({ direction: v })}
          />
        </div>

        {!isSpot && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted">
              {t('position.margin.mode')}
            </span>
            <SegmentedControl
              value={config.marginMode}
              options={[
                { value: 'cross', label: t('position.cross') },
                { value: 'isolated', label: t('position.isolated') },
              ]}
              onChange={v => onConfigChange({ marginMode: v })}
            />
          </div>
        )}
      </div>

      <div className="border-t border-border-var my-3.5" />

      {/* Row 2: Numeric inputs */}
      <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
        <div className="min-w-0">
          <label
            htmlFor={totalCapitalInputId}
            className="block text-xs font-medium text-muted mb-1.5"
          >
            {t('position.total.capital')}
          </label>
          <div className="relative w-full sm:w-[160px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted pointer-events-none">
              $
            </span>
            <NumberInput
              id={totalCapitalInputId}
              value={config.totalCapital}
              onChange={v => onConfigChange({ totalCapital: v ?? 0 })}
              className="w-full pl-7 pr-3 py-2 rounded-lg bg-panel border border-border-var text-text text-sm font-semibold focus:border-accent focus:ring-1 focus:ring-accent/20"
              min="0"
              step="1"
            />
          </div>
        </div>

        {!isSpot && (
          <div className="min-w-0">
            <label
              htmlFor={leverageInputId}
              className="block text-xs font-medium text-muted mb-1.5"
            >
              {t('position.leverage')}
            </label>
            <div className="flex items-center gap-2">
              {/* Input */}
              <div className="relative w-[80px]">
                <NumberInput
                  id={leverageInputId}
                  value={config.leverage}
                  onChange={v =>
                    onConfigChange({
                      leverage: Math.max(1, Math.min(125, v ?? 1)),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-panel border border-border-var text-text text-sm font-semibold focus:border-accent focus:ring-1 focus:ring-accent/20 pr-7"
                  min="1"
                  max="125"
                  step="1"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted pointer-events-none">
                  ×
                </span>
              </div>

              <div className="flex items-center gap-1 flex-wrap">
                {visiblePresets.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onConfigChange({ leverage: preset })}
                    className={`interactive-row rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
                      config.leverage === preset
                        ? 'bg-accent text-accent-text'
                        : 'text-muted hover:text-text hover:bg-panel'
                    }`}
                  >
                    {preset}×
                  </button>
                ))}

                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowMore(!showMore)}
                    aria-expanded={showMore}
                    aria-label={t('position.leverage.more')}
                    title={t('position.leverage.more')}
                    className="interactive-row flex items-center gap-0.5 rounded-md px-2 py-1.5 text-xs font-medium text-muted hover:bg-panel hover:text-text transition-all"
                  >
                    <ChevronDown
                      size={13}
                      className={`transition-transform ${showMore ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {showMore && (
                    <div className="absolute top-full left-0 mt-1 bg-card border border-border-var rounded-lg shadow-lg py-1 z-10 min-w-[64px]">
                      {hiddenPresets.map(preset => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            onConfigChange({ leverage: preset })
                            setShowMore(false)
                          }}
                          className={`interactive-row w-full px-3 py-1.5 text-left text-xs hover:bg-panel ${
                            config.leverage === preset
                              ? 'text-accent font-bold'
                              : 'text-text'
                          }`}
                        >
                          {preset}×
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="min-w-0">
          <label
            htmlFor={feeRateInputId}
            className="block text-xs font-medium text-muted mb-1.5"
          >
            {t('position.fee.rate')}
          </label>
          <div className="relative w-full sm:w-[120px]">
            <NumberInput
              id={feeRateInputId}
              value={config.feeRate}
              onChange={v => onConfigChange({ feeRate: v ?? 0 })}
              className="w-full px-3 py-2 rounded-lg bg-panel border border-border-var text-text text-sm font-semibold focus:border-accent focus:ring-1 focus:ring-accent/20 pr-7"
              step="0.01"
              min="0"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted pointer-events-none">
              %
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
