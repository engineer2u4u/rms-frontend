import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      tenantId: null,
      isAdmin: false,

      setAuth: ({ user, accessToken, refreshToken, tenantId, isAdmin }) =>
        set({
          user: user ?? undefined,
          accessToken: accessToken ?? undefined,
          refreshToken: refreshToken ?? undefined,
          tenantId: tenantId ?? undefined,
          isAdmin: isAdmin ?? undefined,
        }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          tenantId: null,
          isAdmin: false,
        }),
    }),
    {
      name: 'rms-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        tenantId: state.tenantId,
        isAdmin: state.isAdmin,
      }),
    }
  )
);
