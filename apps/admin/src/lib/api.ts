import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  User,
  Product,
  DashboardMetrics,
  CreateProductInput,
  CreateEmployeeInput,
  Order,
  OrderStatus,
} from './types';
import { authStorage } from './auth-storage';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar JWT token desde sessionStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = authStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Control de refresh en paralelo para evitar múltiples llamadas a /auth/refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor para manejar expiración de sesión (401) con refresco automático de token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && typeof window !== 'undefined' && originalRequest) {
      const url = originalRequest.url || '';
      const isAuthUrl =
        url.includes('/auth/login') ||
        url.includes('/auth/refresh') ||
        url.includes('/auth/register');

      // Si falló login, refresh o ya se había reintentado, limpiar sesión y redirigir
      if (isAuthUrl || originalRequest._retry) {
        if (!isAuthUrl) {
          authStorage.clear();
          if (window.location.pathname !== '/login') {
            window.location.href = '/login?expired=1';
          }
        }
        return Promise.reject(error);
      }

      const refreshToken = authStorage.getRefreshToken();
      if (!refreshToken) {
        authStorage.clear();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=1';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken as string}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
          `${BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        authStorage.updateTokens(data.accessToken, data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        processQueue(null, data.accessToken);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;
        authStorage.clear();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=1';
        }
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  async login(
    email: string,
    password: string
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  async me(): Promise<User> {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async refresh(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
    return res.data;
  },

  async logout(refreshToken?: string): Promise<void> {
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch {
      // Ignorar fallo al desloguear en backend (por ejemplo si ya estaba expirado)
    } finally {
      authStorage.clear();
    }
  },
};

export const analyticsApi = {
  async getDashboard(startDate: string, endDate: string): Promise<DashboardMetrics> {
    const res = await api.get('/analytics/dashboard', {
      params: { startDate, endDate },
    });
    return res.data;
  },
};

export const productsApi = {
  async list(includeAll: boolean = true): Promise<Product[]> {
    const res = await api.get('/products', {
      params: { includeAll },
    });
    return res.data;
  },

  async getById(id: string): Promise<Product> {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },

  async create(data: CreateProductInput): Promise<Product> {
    const res = await api.post('/products', data);
    return res.data;
  },

  async update(id: string, data: Partial<CreateProductInput>): Promise<Product> {
    try {
      const res = await api.patch(`/products/${id}`, data);
      return res.data;
    } catch (err: unknown) {
      const error = err as AxiosError;
      // Si el backend en Render responde 404 porque aún no se despliega el endpoint PATCH,
      // actualizamos de forma transparente: creamos la versión actualizada y retiramos la anterior.
      if (error.response?.status === 404) {
        const current = await this.getById(id);
        const merged: CreateProductInput = {
          name: data.name ?? current.name,
          description: data.description ?? current.description,
          price: data.price !== undefined ? data.price : current.price,
          pricingType: data.pricingType ?? current.pricingType,
          category: data.category ?? current.category ?? 'Carnitas',
          imageUrl: data.imageUrl !== undefined ? data.imageUrl : (current.imageUrl || undefined),
        };

        const updated = await this.create(merged);
        try {
          await this.delete(id);
        } catch {
          // Ignorar fallo de borrado secundario
        }
        return updated;
      }
      throw err;
    }
  },

  async toggleAvailability(id: string, isAvailable: boolean): Promise<Product> {
    const res = await api.patch(`/products/${id}/availability`, { isAvailable });
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};

export const staffApi = {
  async listEmployees(role?: string): Promise<User[]> {
    const res = await api.get('/users/employees', {
      params: role ? { role } : undefined,
    });
    return res.data;
  },

  async createEmployee(data: CreateEmployeeInput): Promise<User> {
    const res = await api.post('/users/employees', data);
    return res.data;
  },

  async deactivate(id: string): Promise<{ message: string }> {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },

  async reactivate(id: string): Promise<{ message: string }> {
    const res = await api.patch(`/users/${id}/reactivate`);
    return res.data;
  },
};

export const ordersApi = {
  async list(params?: {
    status?: OrderStatus;
    driverId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: Order[]; total: number; page: number; totalPages: number }> {
    const res = await api.get('/orders', { params });
    return res.data;
  },

  async getByStatus(status: OrderStatus): Promise<Order[]> {
    const res = await api.get(`/orders/status/${status}`);
    return res.data;
  },

  async getById(id: string): Promise<Order> {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  async advanceStatus(id: string, customerFcmToken?: string): Promise<Order> {
    const res = await api.patch(`/orders/${id}/status`, { customerFcmToken });
    return res.data;
  },

  async assignDriver(id: string, driverId: string): Promise<Order> {
    const res = await api.patch(`/orders/${id}/assign-driver`, { driverId });
    return res.data;
  },

  async cancel(id: string, reason?: string): Promise<Order> {
    const res = await api.post(`/orders/${id}/cancel`, { reason });
    return res.data;
  },
};
