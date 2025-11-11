import { Trash2, Pencil } from 'lucide-react'
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

  return (
    <div className="mb-6 flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 border border-border-var rounded-lg p-1 bg-panel overflow-x-auto">
        {plans.map((plan) => (
          <div key={plan.id} className="relative group">
            {editingPlanId === plan.id ? (
              <div className="flex items-center gap-1 px-2 py-1 bg-card rounded-md">
                <input
                  type="text"
                  value={editingPlanName}
                  onChange={(e) => onEditingPlanNameChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onFinishEditingPlan()
                    if (e.key === 'Escape') onCancelEditingPlan()
                  }}
                  onBlur={onFinishEditingPlan}
                  className="w-32 px-2 py-1 text-sm bg-panel border border-border-var rounded text-text focus:outline-none focus:border-accent"
                  autoFocus
                />
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onActivePlanChange(plan.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
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
                      onClick={() => onStartEditingPlan(plan.id, plan.name)}
                      className="p-1.5 hover:bg-panel rounded transition-colors"
                      title={t('position.rename')}
                    >
                      <Pencil size={14} className="text-muted" />
                    </button>
                    {plans.length > 1 && (
                      <button
                        onClick={() => onDeletePlan(plan.id)}
                        className="p-1.5 hover:bg-danger/10 rounded transition-colors"
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
        onClick={onAddPlan}
        className="px-4 py-2 border border-border-var rounded-lg hover:bg-panel transition-colors text-sm text-muted hover:text-text"
      >
        + {t('position.new.tab')}
      </button>
    </div>
  )
}
