import React from "react"
import { Share2, Check, AlertCircle } from "lucide-react"
import { useI18n } from "../lib/i18n"
import { usePositionStore } from "../store/position-store"
import IconButton from "./IconButton"

const ShareButton: React.FC = () => {
  const { t } = useI18n()
  const { plans, activePlanId } = usePositionStore()
  const [copyStatus, setCopyStatus] = React.useState<
    "idle" | "success" | "error"
  >("idle")

  React.useEffect(() => {
    if (copyStatus !== "idle") {
      const timer = setTimeout(() => setCopyStatus("idle"), 2000)
      return () => clearTimeout(timer)
    }
  }, [copyStatus])

  const handleShare = async () => {
    try {
      // 准备要分享的数据
      const shareData = {
        plans,
        activePlanId,
        version: 1, // 用于未来数据格式升级
      }

      // 压缩并编码数据
      const jsonString = JSON.stringify(shareData)
      const encoded = btoa(encodeURIComponent(jsonString))

      // 生成分享链接
      const url = new URL(window.location.origin + window.location.pathname)
      url.searchParams.set("data", encoded)
      const shareUrl = url.toString()

      // 复制到剪贴板
      await navigator.clipboard.writeText(shareUrl)
      setCopyStatus("success")
    } catch (error) {
      console.error("Failed to share:", error)
      setCopyStatus("error")
    }
  }

  // 根据状态选择图标
  const renderIcon = () => {
    if (copyStatus === "success") {
      return <Check size={16} />
    }
    if (copyStatus === "error") {
      return <AlertCircle size={16} />
    }
    return <Share2 size={16} />
  }

  return (
    <IconButton
      icon={renderIcon()}
      onClick={handleShare}
      disabled={copyStatus !== "idle"}
      ariaLabel={t("share.tooltip")}
    />
  )
}

export default ShareButton
