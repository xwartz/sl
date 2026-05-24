import { Pencil, Trash2 } from 'lucide-react'
import { useCallback } from 'react'
import { useI18n } from '../../lib/i18n'
import type { PlanTab } from '../../store/position-store'

interface PlanTabsProps {
  plans: PlanTab[]
  activePlanId: string
  editingPlanId: string | null
  editingPlanName: string
  onActivePlanChange: (planId: string) => void
  onStartEditingPlan: (planId: string, planName: string) => void
  onFinishEditingPlan: () => void
  onCancelEditingPlan: () => void
  onEditingPlanNameChange: (name: string) => void
  onDeletePlan: (planId: string) => void
  onAddPlan: () => void
}

export default function PlanTabs({
  plans,
  activePlanId,
  editingPlanId,
  editingPlanName,
  onActivePlanChange,
  onStartEditingPlan,
  onFinishEditingPlan,
  onCancelEditingPlan,
  onEditingPlanNameChange,
  onDeletePlan,
  onAddPlan,
}: PlanTabsProps) {
  const { t } = useI18n()
  const focusEditingInput = useCallback((input: HTMLInputElement | null) => {
    input?.focus()
  }, [])

  return (
    <div className="mb-6 flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 border border-border-var rounded-lg p-1 bg-panel overflow-x-auto">
        {plans.map(plan => (
          <div key={plan.id} className="relative group">
            {editingPlanId === plan.id ? (
              <div className="flex items-center gap-1 px-2 py-1 bg-card rounded-md">
                <input
                  ref={focusEditingInput}
                  type="text"
                  value={editingPlanName}
                  onChange={e => onEditingPlanNameChange(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') onFinishEditingPlan()
                    if (e.key === 'Escape') onCancelEditingPlan()
                  }}
                  onBlur={onFinishEditingPlan}
                  className="w-32 px-2 py-1 text-sm bg-panel border border-border-var rounded text-text focus:outline-none focus:border-accent"
                />
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onActivePlanChange(plan.id)}
                  className={`interactive-row whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all ${
                    activePlanId === plan.id
                      ? 'bg-card shadow-sm text-text'
                      : 'text-muted hover:text-text'
                  }`}
                >
                  {plan.name}
                </button>
                {activePlanId === plan.id && (
                  <>
                    <button
                      type="button"
                      onClick={() => onStartEditingPlan(plan.id, plan.name)}
                      className="interactive-row rounded p-1.5 hover:bg-panel"
                      title={t('position.rename')}
                    >
                      <Pencil size={14} className="text-muted" />
                    </button>
                    {plans.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeletePlan(plan.id)}
                        className="interactive-row rounded p-1.5 hover:bg-danger/10"
                        title={t('position.delete')}
                      >
                        <Trash2 size={14} className="text-danger" />
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAddPlan}
        className="interactive-row rounded-lg border border-border-var px-4 py-2 text-sm text-muted hover:bg-panel hover:text-text"
      >
        + {t('position.new.tab')}
      </button>
    </div>
  )
}
