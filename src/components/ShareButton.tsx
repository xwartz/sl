import React from 'react'
import { createPortal } from 'react-dom'
import {
  Share2,
  Check,
  AlertCircle,
  Link,
  QrCode,
  Download,
  Upload,
  X,
} from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { usePositionStore, type PlanTab } from '../store/position-store'
import IconButton from './IconButton'

const ShareButton: React.FC = () => {
  const { t } = useI18n()
  const { plans, activePlanId } = usePositionStore()
  const store = usePositionStore()
  const [isOpen, setIsOpen] = React.useState(false)
  const [copyStatus, setCopyStatus] = React.useState<
    'idle' | 'success' | 'error'
  >('idle')
  const [showQR, setShowQR] = React.useState(false)
  const [shareUrl, setShareUrl] = React.useState('')
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  React.useEffect(() => {
    if (copyStatus !== 'idle') {
      const timer = setTimeout(() => setCopyStatus('idle'), 2000)
      return () => clearTimeout(timer)
    }
  }, [copyStatus])

  const generateUrl = () => {
    const shareData = { plans, activePlanId, version: 1 }
    const jsonString = JSON.stringify(shareData)
    const encoded = btoa(encodeURIComponent(jsonString))
    const url = new URL(window.location.origin + window.location.pathname)
    url.searchParams.set('data', encoded)
    return url.toString()
  }

  const handleCopy = async () => {
    try {
      const url = generateUrl()
      await navigator.clipboard.writeText(url)
      setCopyStatus('success')
    } catch {
      setCopyStatus('error')
    }
    setIsOpen(false)
  }

  const handleQR = () => {
    const url = generateUrl()
    setShareUrl(url)
    setShowQR(true)
    setIsOpen(false)
  }

  const handleExport = () => {
    const shareData = { plans, activePlanId, version: 1 }
    const blob = new Blob([JSON.stringify(shareData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trading-plans-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setIsOpen(false)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string) as {
            plans: PlanTab[]
          }
          if (data.plans && Array.isArray(data.plans)) {
            // Give imported plans new IDs to avoid conflicts
            const importedPlans = data.plans.map((p: PlanTab) => ({
              ...p,
              id: `${p.id}-imp-${Date.now()}`,
              name: `${p.name} ${t('import.suffix')}`,
            }))
            store.setPlans([...store.plans, ...importedPlans])
            if (importedPlans[0]) store.setActivePlanId(importedPlans[0].id)
          }
        } catch (err) {
          console.error('Import error:', err)
        }
      }
      reader.readAsText(file)
    }
    input.click()
    setIsOpen(false)
  }

  const renderIcon = () => {
    if (copyStatus === 'success') return <Check size={16} />
    if (copyStatus === 'error') return <AlertCircle size={16} />
    return <Share2 size={16} />
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <IconButton
          icon={renderIcon()}
          onClick={() => setIsOpen(!isOpen)}
          ariaLabel={t('share.tooltip')}
        />

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border-var rounded-lg shadow-lg z-50 py-1">
            <button
              onClick={handleCopy}
              className="w-full px-4 py-2.5 text-sm text-text hover:bg-panel text-left flex items-center gap-3 transition-colors"
            >
              <Link size={15} className="text-muted" />
              {t('share.copy.link')}
            </button>
            <button
              onClick={handleQR}
              className="w-full px-4 py-2.5 text-sm text-text hover:bg-panel text-left flex items-center gap-3 transition-colors"
            >
              <QrCode size={15} className="text-muted" />
              {t('share.qr.code')}
            </button>
            <hr className="my-1 border-border-var" />
            <button
              onClick={handleExport}
              className="w-full px-4 py-2.5 text-sm text-text hover:bg-panel text-left flex items-center gap-3 transition-colors"
            >
              <Download size={15} className="text-muted" />
              {t('share.export')}
            </button>
            <button
              onClick={handleImport}
              className="w-full px-4 py-2.5 text-sm text-text hover:bg-panel text-left flex items-center gap-3 transition-colors"
            >
              <Upload size={15} className="text-muted" />
              {t('share.import')}
            </button>
          </div>
        )}
      </div>

      {/* QR Code Modal - Rendered via Portal */}
      {showQR &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
            onClick={() => setShowQR(false)}
          >
            <div
              className="bg-card rounded-xl p-6 max-w-sm w-full shadow-2xl border border-border-var my-auto max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text">
                  {t('share.qr.title')}
                </h3>
                <button
                  onClick={() => setShowQR(false)}
                  className="p-1.5 hover:bg-panel rounded-lg transition-colors"
                >
                  <X size={18} className="text-muted" />
                </button>
              </div>

              {shareUrl.length > 2000 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-warning mb-2">
                    {t('share.qr.too.long')}
                  </p>
                  <p className="text-xs text-muted">
                    {t('share.qr.use.export')}
                  </p>
                </div>
              ) : (
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>
              )}

              <p className="text-xs text-muted mt-4 text-center break-all line-clamp-3">
                {shareUrl}
              </p>

              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(shareUrl)
                  setCopyStatus('success')
                  setShowQR(false)
                }}
                className="w-full mt-4 py-2.5 rounded-lg bg-accent text-accent-text text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {t('share.copy.link')}
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

export default ShareButton
