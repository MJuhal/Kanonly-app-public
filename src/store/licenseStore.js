import { create } from 'zustand';

// Stub del store de licencias para la versión pública (free, sin sistema PRO)
export const useLicenseStore = create((set) => ({
  isPro: false,
  licenseChecked: true,
  storeError: null,
  isActivating: false,

  checkLicense: async () => {
    // No-op: en la versión pública no hay sistema de licencias
    set({ isPro: false, licenseChecked: true, storeError: null });
  },

  activateLicense: async () => {
    // No-op: no hay activación en la versión pública
    return false;
  },

  clearError: () => set({ storeError: null }),
}));
