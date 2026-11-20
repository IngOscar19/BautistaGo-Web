import { create } from 'zustand';
import { User } from './types';
import { authApi } from './api';
import { authStorage, isTokenExpired } from './auth-storage';
import { AxiosError } from 'axios';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    if (typeof window === 'undefined') return;

    // Si ya está inicializado y autenticado con token válido, no volver a bloquear la pantalla
    const current = get();
    if (
      current.isInitialized &&
      current.isAuthenticated &&
      current.user &&
      current.token &&
      !isTokenExpired(current.token, 30)
    ) {
      return;
    }

    // Evitar ejecuciones simultáneas de inicialización
    if (current.isLoading) return;

    // Limpiar cualquier residuo de versiones anteriores en localStorage
    authStorage.clearLegacyLocalStorage();

    const storedToken = authStorage.getToken();
    const storedRefreshToken = authStorage.getRefreshToken();
    const cachedUser = authStorage.getUser<User>();

    if (!storedToken || !cachedUser) {
      authStorage.clear();
      set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isInitialized: true,
        isLoading: false,
        error: null,
      });
      return;
    }

    set({ isLoading: true });

    let activeToken = storedToken;
    let activeRefreshToken = storedRefreshToken;

    // 1. Verificación del tiempo de expiración del JWT en cliente
    if (isTokenExpired(activeToken)) {
      if (activeRefreshToken) {
        try {
          const refreshed = await authApi.refresh(activeRefreshToken);
          activeToken = refreshed.accessToken;
          activeRefreshToken = refreshed.refreshToken;
          authStorage.updateTokens(activeToken, activeRefreshToken);
        } catch {
          // Si el refresco falla, la sesión ya no es válida
          authStorage.clear();
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isInitialized: true,
            isLoading: false,
            error: null,
          });
          return;
        }
      } else {
        // Token expirado sin refresh token disponible
        authStorage.clear();
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isInitialized: true,
          isLoading: false,
          error: null,
        });
        return;
      }
    }

    // 2. Validación de la sesión en el backend con /auth/me
    try {
      const freshUser = await authApi.me();

      if (freshUser.role !== 'ADMIN') {
        authStorage.clear();
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isInitialized: true,
          isLoading: false,
          error: 'Acceso denegado: Se requieren permisos de Administrador.',
        });
        return;
      }

      authStorage.setUser(freshUser);
      set({
        user: freshUser,
        token: activeToken,
        refreshToken: activeRefreshToken,
        isAuthenticated: true,
        isInitialized: true,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string; error?: string }>;

      // Si el token fue rechazado con 401 pero existe refresh token, intentar rotar
      if (axiosErr.response?.status === 401 && activeRefreshToken) {
        try {
          const refreshed = await authApi.refresh(activeRefreshToken);
          authStorage.updateTokens(refreshed.accessToken, refreshed.refreshToken);
          const freshUser = await authApi.me();

          if (freshUser.role === 'ADMIN') {
            authStorage.setUser(freshUser);
            set({
              user: freshUser,
              token: refreshed.accessToken,
              refreshToken: refreshed.refreshToken,
              isAuthenticated: true,
              isInitialized: true,
              isLoading: false,
              error: null,
            });
            return;
          }
        } catch {
          // El refresco falló
        }
      }

      // Si el servidor local fue detenido o no responde, o la sesión expiró:
      // Se limpia la sesión para evitar estados inconsistentes (pantallas con sesión fantasma).
      authStorage.clear();
      set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isInitialized: true,
        isLoading: false,
        error: axiosErr.response?.status === 401
          ? null
          : 'No se pudo conectar con el backend. Por favor inicia sesión nuevamente.',
      });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.login(email, password);

      if (data.user.role !== 'ADMIN') {
        throw new Error('Acceso denegado: Se requieren permisos de Administrador para acceder a este panel.');
      }

      // Guardar en sessionStorage
      authStorage.setSession(data.accessToken, data.refreshToken, data.user);

      set({
        user: data.user,
        token: data.accessToken,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: string; message?: string }>;
      const msg =
        axiosErr.response?.data?.error ||
        axiosErr.response?.data?.message ||
        (err instanceof Error ? err.message : 'Error al iniciar sesión. Verifica tus credenciales.');
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  logout: async () => {
    const { refreshToken } = get();
    set({ isLoading: true });
    try {
      await authApi.logout(refreshToken || undefined);
    } finally {
      authStorage.clear();
      set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
