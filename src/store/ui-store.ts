import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIStore {
  sidebarCollapsed: boolean
  advancedSettingsOpen: boolean
  actions: {
    toggleSidebar: () => void
    setSidebarCollapsed: (collapsed: boolean) => void
    setAdvancedSettingsOpen: (open: boolean) => void
  }
}

const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      advancedSettingsOpen: false,
      actions: {
        toggleSidebar: () =>
          set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
        setAdvancedSettingsOpen: (open) => set({ advancedSettingsOpen: open }),
      },
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
)

export const useUIActions = () => useUIStore((state) => state.actions)

export default useUIStore
