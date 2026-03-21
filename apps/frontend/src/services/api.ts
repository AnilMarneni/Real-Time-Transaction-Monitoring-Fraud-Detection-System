import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = 'http://localhost:4000';

class ApiService {
  private getAuthHeaders(): Record<string, string> {
    const { token } = useAuthStore.getState();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const authHeaders = this.getAuthHeaders();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(options.headers as Record<string, string>),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    email: string;
    password: string;
    name?: string;
  }) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.request('/api/auth/profile');
  }

  // Transaction endpoints
  async createTransaction(transactionData: {
    amount: number;
    description?: string;
    recipientId?: string;
  }) {
    return this.request('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async getTransactions(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = params.page.toString();
    if (params?.limit) queryParams.limit = params.limit.toString();
    if (params?.status) queryParams.status = params.status;
    const query = Object.keys(queryParams).length > 0 ? `?${new URLSearchParams(queryParams)}` : '';
    return this.request(`/api/transactions${query}`);
  }

  // Rules endpoints
  async getRules() {
    return this.request('/api/rules');
  }

  async getRule(id: string) {
    return this.request(`/api/rules/${id}`);
  }

  async createRule(ruleData: {
    name: string;
    description: string;
    condition: string;
    action: string;
    threshold?: number;
  }) {
    return this.request('/api/rules', {
      method: 'POST',
      body: JSON.stringify(ruleData),
    });
  }

  async updateRule(id: string, ruleData: {
    name?: string;
    description?: string;
    condition?: string;
    action?: string;
    threshold?: number;
  }) {
    return this.request(`/api/rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ruleData),
    });
  }

  async deleteRule(id: string) {
    return this.request(`/api/rules/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleRule(id: string) {
    return this.request(`/api/rules/${id}/toggle`, {
      method: 'PATCH',
    });
  }

  // Generic GET method
  async get(endpoint: string) {
    return this.request(endpoint);
  }

  // Dashboard endpoints
  async getDashboardMetrics() {
    return this.request('/api/dashboard/metrics');
  }

  async getRiskTrends() {
    return this.request('/api/dashboard/risk-trends');
  }

  async getAlerts(params?: {
    page?: number;
    limit?: number;
    severity?: string;
    resolved?: boolean;
  }) {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = params.page.toString();
    if (params?.limit) queryParams.limit = params.limit.toString();
    if (params?.severity) queryParams.severity = params.severity;
    if (params?.resolved !== undefined) queryParams.resolved = params.resolved.toString();
    const query = Object.keys(queryParams).length > 0 ? `?${new URLSearchParams(queryParams)}` : '';
    return this.request(`/api/dashboard/alerts${query}`);
  }

  async getGeographicRisk() {
    return this.request('/api/dashboard/geographic-risk');
  }

  // WebSocket connection for real-time updates
  createWebSocketConnection(): WebSocket {
    const wsUrl = API_BASE_URL.replace('http', 'ws');
    return new WebSocket(wsUrl);
  }
}

export const apiService = new ApiService();
