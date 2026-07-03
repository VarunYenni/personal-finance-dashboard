import { create } from "zustand";

type Theme = "dark" | "light";

interface UiState {
  theme: Theme;
  sidebarOpen: boolean;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: (localStorage.getItem("theme") as Theme) ?? "dark",
  sidebarOpen: false,
  setTheme: (theme) => {
    localStorage.setItem("theme", theme);
    document.documentElement.dataset.theme = theme;
    set({ theme });
  },
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen }))
}));
