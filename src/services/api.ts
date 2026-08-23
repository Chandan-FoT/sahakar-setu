const API_BASE = 'http://localhost:5000/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const credentials = undefined;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorBody.message || `HTTP Error ${response.status}`);
  }

  return response.json();
}

export const api = {
  checkHealth: () => request<{ status: string }>('/health'),

  services: {
    getAll: () => request<{ success: boolean; data: any[] }>('/services'),
    getById: (id: string) => request<{ success: boolean; data: any }>(`/services/${id}`),
  },

  workers: {
    getAll: (params?: { trade?: string; isAvailable?: boolean }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<{ success: boolean; data: any[] }>(`/workers${query ? `?${query}` : ''}`);
    },
    getById: (id: string) => request<{ success: boolean; data: any }>(`/workers/${id}`),
    toggleAvailability: (id: string) => request<{ success: boolean; data: any }>(`/workers/${id}/availability`, { method: 'PATCH' }),
    register: (data: any) => request<{ success: boolean; data: any }>('/workers/register', { method: 'POST', body: JSON.stringify(data) }),
  },

  bookings: {
    getAll: (params?: { status?: string; workerId?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<{ success: boolean; data: any[] }>(`/bookings${query ? `?${query}` : ''}`);
    },
    create: (data: {
      serviceCategoryId: string;
      items: { itemId: string; qty: number }[];
      bookingType: 'INSTANT_SOS' | 'SCHEDULED';
      customerAddress: string;
      customerName?: string;
      customerPhone?: string;
      problemDescription?: string;
    }) => request<{ success: boolean; data: any }>('/bookings', { method: 'POST', body: JSON.stringify(data) }),
    accept: (id: string, workerId?: string) => request<{ success: boolean; data: any }>(`/bookings/${id}/accept`, { method: 'PATCH', body: JSON.stringify({ workerId }) }),
    startWithOtp: (id: string, otp: string) => request<{ success: boolean; data: any }>(`/bookings/${id}/start-otp`, { method: 'POST', body: JSON.stringify({ otp }) }),
    complete: (id: string, proofPhotoUrl?: string) => request<{ success: boolean; data: any }>(`/bookings/${id}/complete`, { method: 'POST', body: JSON.stringify({ proofPhotoUrl }) }),
    pay: (id: string, paymentMethod: 'UPI' | 'CARD' | 'CASH') => request<{ success: boolean; data: any }>(`/bookings/${id}/pay`, { method: 'POST', body: JSON.stringify({ paymentMethod }) }),
    rate: (id: string, rating: number, comment: string) => request<{ success: boolean; data: any }>(`/bookings/${id}/rate`, { method: 'POST', body: JSON.stringify({ rating, comment }) }),
  },

  welfare: {
    get: (workerId: string) => request<{ success: boolean; data: any }>(`/welfare/${workerId}`),
    requestLoan: (data: { workerId: string; amount: number; purpose: string }) => request<{ success: boolean; data: any }>('/welfare/loan-request', { method: 'POST', body: JSON.stringify(data) }),
  },

  admin: {
    getMetrics: () => request<{ success: boolean; data: any }>('/admin/metrics'),
    getForecasts: () => request<{ success: boolean; data: any[] }>('/admin/demand-forecast'),
    verifyWorker: (id: string, status: 'VERIFIED' | 'SUSPENDED') => request<{ success: boolean; data: any }>(`/admin/verify-worker/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    getDisputes: () => request<{ success: boolean; data: any[] }>('/admin/disputes'),
    resolveDispute: (id: string, resolutionNote: string) => request<{ success: boolean; data: any }>(`/admin/resolve-dispute/${id}`, { method: 'POST', body: JSON.stringify({ resolutionNote }) }),
  }
};
