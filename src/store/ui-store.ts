import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIStore {
  sidebarCollapsed: boolean
  advancedSettingsOpen: boolean
  settingsDialogOpen: boolean
  actions: {
    toggleSidebar: () => void
    setSidebarCollapsed: (collapsed: boolean) => void
    setAdvancedSettingsOpen: (open: boolean) => void
    setSettingsDialogOpen: (open: boolean) => void
  }
}

const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      advancedSettingsOpen: false,
      settingsDialogOpen: false,
      actions: {
        toggleSidebar: () =>
          set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
        setAdvancedSettingsOpen: (open) => set({ advancedSettingsOpen: open }),
        setSettingsDialogOpen: (open) => set({ settingsDialogOpen: open }),
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
