import { create } from "zustand";

export type MobileView = "list" | "detail";
export type ModalId =
  | "search-users"
  | "username-setup"
  | "notifications"
  | "conversation-requests"
  | "create-group"
  | "join-group"
  | null;

interface UIState {
  sidebarOpen: boolean;
  mobileView: MobileView;
  activeModal: ModalId;
  setMobileView: (view: MobileView) => void;
  toggleSidebar: () => void;
  openModal: (id: Exclude<ModalId, null>) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  mobileView: "list",
  activeModal: null,
  setMobileView: (view) => set({ mobileView: view }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
}));
