import { create } from 'zustand';

export const useLicenseStore = create(() => ({
  isPro: false,
  licenseChecked: true,
  storeError: null,
  isActivating: false,

  checkLicense: async () => {},
  activateLicense: async () => false,
  clearError: () => {},
}));
