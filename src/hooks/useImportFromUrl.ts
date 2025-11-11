import { useEffect, useState } from "react"
import { usePositionStore, type PlanTab } from "../store/position-store"
import { useI18n } from "../lib/i18n"

interface ImportResult {
  status: "idle" | "success" | "error"
  message?: string
}

interface ShareData {
  plans: PlanTab[]
  activePlanId: string
  version: number
}

export function useImportFromUrl() {
  const [importResult, setImportResult] = useState<ImportResult>({
    status: "idle",
  })
  const hasHydrated = usePositionStore((state) => state._hasHydrated)
  const store = usePositionStore()
  const { t } = useI18n()

  useEffect(() => {
    // 等待 Zustand persist 恢复完成
    if (!hasHydrated) {
      return
    }

    // 检查 URL 中是否有数据参数
    const urlParams = new URLSearchParams(window.location.search)
    const dataParam = urlParams.get("data")

    if (!dataParam) {
      return
    }

    try {
      // 解码数据
      const decoded = decodeURIComponent(atob(dataParam))
      const shareData = JSON.parse(decoded) as ShareData

      // 验证数据格式
      if (!shareData.plans || !Array.isArray(shareData.plans)) {
        throw new Error("Invalid data format")
      }

      // 获取当前最新的 plans
      const currentPlans = store.plans

      // 智能导入：检查内容是否相同，而不仅仅是 ID
      const existingPlansMap = new Map(currentPlans.map((p) => [p.id, p]))
      const plansToImport: PlanTab[] = []

      for (const sharedPlan of shareData.plans) {
        const existingPlan = existingPlansMap.get(sharedPlan.id)

        if (!existingPlan) {
          // 计划不存在，直接导入
          plansToImport.push(sharedPlan)
        } else {
          // 计划 ID 已存在，检查内容是否相同
          const isContentSame =
            JSON.stringify(existingPlan) === JSON.stringify(sharedPlan)

          if (!isContentSame) {
            // 内容不同，创建一个新的副本（带新 ID）
            const newPlan: PlanTab = {
              ...sharedPlan,
              id: `${sharedPlan.id}-imported-${Date.now()}`,
              name: `${sharedPlan.name} ${t("import.suffix")}`,
            }
            plansToImport.push(newPlan)
          }
        }
      }

      if (plansToImport.length > 0) {
        store.setPlans([...currentPlans, ...plansToImport])
        // 如果有新导入的计划，切换到第一个
        store.setActivePlanId(plansToImport[0].id)
        setImportResult({
          status: "success",
          message: `Imported ${plansToImport.length} plan(s)`,
        })
      } else {
        setImportResult({
          status: "success",
          message: "All plans already exist",
        })
      }

      // 清除 URL 参数（不刷新页面）
      urlParams.delete("data")
      const newUrl = urlParams.toString()
        ? `${window.location.pathname}?${urlParams.toString()}`
        : window.location.pathname
      window.history.replaceState({}, "", newUrl)
    } catch (error) {
      console.error("Failed to import from URL:", error)
      setImportResult({
        status: "error",
        message: error instanceof Error ? error.message : "Import failed",
      })

      // 清除无效的 URL 参数
      urlParams.delete("data")
      const newUrl = urlParams.toString()
        ? `${window.location.pathname}?${urlParams.toString()}`
        : window.location.pathname
      window.history.replaceState({}, "", newUrl)
    }
  }, [hasHydrated, store, t])

  return importResult
}

