import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { OrderEntry, PositionConfig } from '../lib/position-calculator'

export interface PlanTab {
  id: string
  name: string
  config: PositionConfig
  orders: OrderEntry[]
}

interface PositionStore {
  // 状态
  activePlanId: string
  plans: PlanTab[]
  editingPlanId: string | null
  editingPlanName: string
  _hasHydrated: boolean

  // Actions
  setActivePlanId: (id: string) => void
  setPlans: (plans: PlanTab[]) => void
  setHasHydrated: (state: boolean) => void

  // 编辑计划名称
  startEditingPlan: (planId: string, currentName: string) => void
  finishEditingPlan: () => void
  cancelEditingPlan: () => void
  setEditingPlanName: (name: string) => void

  // 计划操作
  addPlan: (plan: PlanTab) => void
  deletePlan: (planId: string) => void
  updatePlanConfig: (planId: string, config: Partial<PositionConfig>) => void

  // 订单操作
  addOrder: (planId: string, order: OrderEntry) => void
  updateOrder: (
    planId: string,
    orderId: string,
    updates: Partial<OrderEntry>
  ) => void
  deleteOrder: (planId: string, orderId: string) => void
  duplicateOrder: (planId: string, orderId: string) => void
}

export const usePositionStore = create<PositionStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      activePlanId: 'default',
      plans: [
        {
          id: 'default',
          name: 'BTC Long Plan',
          config: {
            direction: 'long',
            leverage: 10,
            feeRate: 0.05,
            totalCapital: 10000,
            marginMode: 'cross', // 默认全仓模式
            tradingMode: 'futures', // 默认合约模式
          },
          orders: [{ id: '1', price: 100000, quantity: 0.1 }],
        },
      ],
      editingPlanId: null,
      editingPlanName: '',
      _hasHydrated: false,

      // Actions
      setActivePlanId: (id) => set({ activePlanId: id }),

      setPlans: (plans) => set({ plans }),

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      // 编辑计划名称
      startEditingPlan: (planId, currentName) =>
        set({ editingPlanId: planId, editingPlanName: currentName }),

      finishEditingPlan: () => {
        const { editingPlanId, editingPlanName, plans } = get()
        if (editingPlanId && editingPlanName.trim()) {
          set({
            plans: plans.map((p) =>
              p.id === editingPlanId
                ? { ...p, name: editingPlanName.trim() }
                : p
            ),
            editingPlanId: null,
            editingPlanName: '',
          })
        } else {
          set({ editingPlanId: null, editingPlanName: '' })
        }
      },

      cancelEditingPlan: () =>
        set({ editingPlanId: null, editingPlanName: '' }),

      setEditingPlanName: (name) => set({ editingPlanName: name }),

      // 计划操作
      addPlan: (plan) => {
        set((state) => ({
          plans: [...state.plans, plan],
          activePlanId: plan.id,
        }))
      },

      deletePlan: (planId) => {
        const { plans, activePlanId } = get()
        if (plans.length <= 1) return

        const newPlans = plans.filter((p) => p.id !== planId)
        set({
          plans: newPlans,
          activePlanId: activePlanId === planId ? newPlans[0].id : activePlanId,
        })
      },

      updatePlanConfig: (planId, config) => {
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === planId ? { ...p, config: { ...p.config, ...config } } : p
          ),
        }))
      },

      // 订单操作
      addOrder: (planId, order) => {
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === planId ? { ...p, orders: [...p.orders, order] } : p
          ),
        }))
      },

      updateOrder: (planId, orderId, updates) => {
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === planId
              ? {
                  ...p,
                  orders: p.orders.map((o) =>
                    o.id === orderId ? { ...o, ...updates } : o
                  ),
                }
              : p
          ),
        }))
      },

      deleteOrder: (planId, orderId) => {
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === planId
              ? { ...p, orders: p.orders.filter((o) => o.id !== orderId) }
              : p
          ),
        }))
      },

      duplicateOrder: (planId, orderId) => {
        const { plans } = get()
        const plan = plans.find((p) => p.id === planId)
        if (!plan) return

        const order = plan.orders.find((o) => o.id === orderId)
        if (!order) return

        const newOrder: OrderEntry = {
          ...order,
          id: Date.now().toString(),
        }

        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === planId ? { ...p, orders: [...p.orders, newOrder] } : p
          ),
        }))
      },
    }),
    {
      name: 'position-calculator-storage', // localStorage key
      version: 1, // 版本号，用于迁移
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
