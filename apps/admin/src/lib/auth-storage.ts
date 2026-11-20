/**
 * Gestión centralizada de almacenamiento para tokens y sesión de usuario.
 *
 * Se utiliza `sessionStorage` en lugar de `localStorage` para garantizar que
 * la sesión expire automáticamente al cerrar la pestaña o el navegador, evitando
 * que sesiones huérfanas o desincronizadas persistan cuando el proyecto local
 * se detiene o se reinicia.
 */

const TOKEN_KEY = 'bautistago_admin_token';
const REFRESH_TOKEN_KEY = 'bautistago_admin_refresh_token';
const USER_KEY = 'bautistago_admin_user';

export const authStorage = {
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getUser<T = unknown>(): T | null {
    if (typeof window === 'undefined') return null;
    const str = sessionStorage.getItem(USER_KEY);
    if (!str) return null;
    try {
      return JSON.parse(str) as T;
    } catch {
      return null;
    }
  },

  setSession(accessToken: string, refreshToken: string, user: unknown) {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(TOKEN_KEY, accessToken);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    this.clearLegacyLocalStorage();
  },

  updateTokens(accessToken: string, refreshToken: string) {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(TOKEN_KEY, accessToken);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    this.clearLegacyLocalStorage();
  },

  setUser(user: unknown) {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear() {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    this.clearLegacyLocalStorage();
  },

  /**
   * Limpia residuos previos de localStorage si alguna versión anterior
   * dejó almacenados tokens persistentes que causaban mantener la sesión abierta
   * tras detener el servidor local.
   */
  clearLegacyLocalStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // Ignorar excepciones en entornos con storage bloqueado
    }
  },
};

/**
 * Valida si un JWT está expirado o próximo a expirar (margen por defecto: 10 segundos).
 */
export function isTokenExpired(token: string, bufferSeconds = 10): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload) as { exp?: number };
    if (!payload.exp) return false;
    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp <= nowInSeconds + bufferSeconds;
  } catch {
    return true;
  }
}
