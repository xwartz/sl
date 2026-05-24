import { CheckCircle, X, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useImportFromUrl } from '../hooks/useImportFromUrl'
import { useI18n } from '../lib/i18n'

export default function ImportNotification() {
  const { t } = useI18n()
  const importResult = useImportFromUrl()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (importResult.status !== 'idle') {
      setVisible(true)
      const timer = setTimeout(() => setVisible(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [importResult.status])

  if (!visible || importResult.status === 'idle') {
    return null
  }

  const isSuccess = importResult.status === 'success'

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in">
      <div
        className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm ${
          isSuccess ? 'surface-success' : 'surface-danger'
        }`}
      >
        {isSuccess ? (
          <CheckCircle size={20} className="flex-shrink-0" />
        ) : (
          <XCircle size={20} className="flex-shrink-0" />
        )}
        <div className="flex-1">
          <p className="text-sm font-medium">
            {isSuccess ? t('import.success') : t('import.error')}
          </p>
          {importResult.message && (
            <p className="text-xs opacity-80">{importResult.message}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label={t('share.close')}
          className="interactive-row flex-shrink-0 rounded-md p-1 opacity-60 hover:opacity-100"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
