import {
  User,
  Customer,
  FollowUpNote,
  Product,
  StockMovement,
  SalesChallan,
  DashboardStats,
  Role,
} from '../types';

const getApiBase = (): string => {
  const metaEnv = (import.meta as any).env?.VITE_API_URL;
  if (metaEnv && typeof metaEnv === 'string' && metaEnv.trim().length > 0) {
    const cleanUrl = metaEnv.trim().replace(/\/$/, '');
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }
  return '/api';
};

const API_BASE = getApiBase();

function getAuthToken(): string | null {
  return localStorage.getItem('wholesale_erp_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    const targetHost = API_BASE.startsWith('http') ? API_BASE : window.location.origin + API_BASE;
    throw new Error(
      `Network Error: Failed to connect to API server at '${targetHost}'. Please check your CORS configuration or verify that the backend service is running.`
    );
  }

  let data: any = {};
  try {
    data = await response.json();
  } catch (jsonErr) {
    if (!response.ok) {
      throw new Error(
        `Server Error (${response.status}): The backend returned a non-JSON response. Check backend URL ('${API_BASE}') and server logs.`
      );
    }
  }

  if (!response.ok) {
    const fallbackMessage =
      response.status === 404
        ? `API endpoint '${endpoint}' not found (404) at '${API_BASE}'. Verify your VITE_API_URL setting.`
        : response.status === 500
        ? 'Internal Server Error (500). Please check backend logs.'
        : `Request failed with status ${response.status}.`;

    const error: any = new Error(data.message || fallbackMessage);
    error.status = response.status;
    error.errorType = data.error || 'ApiError';
    error.shortageDetails = data.shortageDetails;
    throw error;
  }

  return data as T;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => request<{ user: User }>('/auth/me'),

  updateProfile: (data: {
    name?: string;
    email?: string;
    currentPassword: string;
    newPassword?: string;
    confirmPassword?: string;
  }) =>
    request<{
      message: string;
      token: string;
      user: User;
      emailChanged: boolean;
    }>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  registerStaff: (data: { name: string; email: string; password: string; role: Role }) =>
    request<{ message: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Dashboard
  getDashboardStats: () => request<DashboardStats>('/dashboard/stats'),

  // Customers
  getCustomers: (params?: { page?: number; limit?: number; q?: string; status?: string; type?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.q) query.set('q', params.q);
    if (params?.status) query.set('status', params.status);
    if (params?.type) query.set('type', params.type);
    return request<{ items: Customer[]; total: number; page: number; limit: number; totalPages: number }>(
      `/customers?${query.toString()}`
    );
  },

  getCustomerById: (id: string) => request<Customer>(`/customers/${id}`),

  createCustomer: (data: Partial<Customer>) =>
    request<{ message: string; customer: Customer }>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCustomer: (id: string, data: Partial<Customer>) =>
    request<{ message: string; customer: Customer }>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCustomer: (id: string) =>
    request<{ message: string }>(`/customers/${id}`, {
      method: 'DELETE',
    }),

  addFollowUpNote: (customerId: string, note: string) =>
    request<{ message: string; note: FollowUpNote }>(`/customers/${customerId}/followups`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    }),

  // Products
  getProducts: (params?: { page?: number; limit?: number; q?: string; lowStock?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.q) query.set('q', params.q);
    if (params?.lowStock) query.set('lowStock', 'true');
    return request<{ items: Product[]; total: number; page: number; limit: number; totalPages: number }>(
      `/products?${query.toString()}`
    );
  },

  getProductById: (id: string) => request<Product & { movements: StockMovement[] }>(`/products/${id}`),

  createProduct: (data: Partial<Product>) =>
    request<{ message: string; product: Product }>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProduct: (id: string, data: Partial<Product>) =>
    request<{ message: string; product: Product }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteProduct: (id: string) =>
    request<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    }),

  recordStockMovement: (productId: string, data: { quantityChanged: number; movementType: 'IN' | 'OUT'; reason: string }) =>
    request<{ message: string; stockMovement: StockMovement; currentStock: number }>(`/products/${productId}/stock-movements`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAllStockMovements: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return request<{ items: StockMovement[]; total: number; page: number; limit: number; totalPages: number }>(
      `/products/stock-movements/all?${query.toString()}`
    );
  },

  // Sales Challans
  getChallans: (params?: { page?: number; limit?: number; status?: string; customerId?: string; q?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.status) query.set('status', params.status);
    if (params?.customerId) query.set('customerId', params.customerId);
    if (params?.q) query.set('q', params.q);
    return request<{ items: SalesChallan[]; total: number; page: number; limit: number; totalPages: number }>(
      `/challans?${query.toString()}`
    );
  },

  getChallanById: (id: string) => request<SalesChallan>(`/challans/${id}`),

  createChallan: (data: {
    customerId: string;
    deliveryAddress?: string;
    remarks?: string;
    status?: 'DRAFT' | 'CONFIRMED';
    items: { productId: string; quantity: number }[];
  }) =>
    request<{ message: string; challan: SalesChallan }>('/challans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  confirmChallan: (id: string) =>
    request<{ message: string; challan: SalesChallan }>(`/challans/${id}/confirm`, {
      method: 'PATCH',
    }),

  cancelChallan: (id: string) =>
    request<{ message: string; challan: SalesChallan }>(`/challans/${id}/cancel`, {
      method: 'PATCH',
    }),
};
