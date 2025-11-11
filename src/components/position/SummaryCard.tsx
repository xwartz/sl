interface SummaryItem {
  label: string
  value: string
  valueClassName?: string
}

interface SummaryCardProps {
  icon: string
  title: string
  items: SummaryItem[]
  warning?: {
    show: boolean
    message: string
  }
}

export default function SummaryCard({
  icon,
  title,
  items,
  warning,
}: SummaryCardProps) {
  return (
    <div className="bg-gradient-to-br from-panel to-panel/50 rounded-xl p-5 border border-border-var">
      <div className="text-sm font-medium text-muted mb-4">
        {icon} {title}
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-baseline">
            <span className="text-xs text-muted">{item.label}</span>
            <span
              className={
                item.valueClassName || "text-lg font-semibold text-text"
              }
            >
              {item.value}
            </span>
          </div>
        ))}
        {warning?.show && (
          <div className="text-xs text-danger bg-danger/10 px-2 py-1 rounded">
            ⚠️ {warning.message}
          </div>
        )}
      </div>
    </div>
  )
}
