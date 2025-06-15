// API service for backend communication
const API_BASE_URL = 'http://localhost:5001/api';

// Types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'team_member' | 'scrum_master' | 'product_owner';
  created_at?: string;
}

export interface Company {
  id: number;
  name: string;
  price: number;
  change: number;
  marketCap: string;
  created_at?: string;
}

export interface Investment {
  id: number;
  user_id: number;
  company_id: number;
  amount: number;
  shares: number;
  created_at: string;
  company_name?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
  message?: string;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || error.error || 'API request failed');
  }
  return response.json();
}

// Auth API
export const authAPI = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse<LoginResponse>(response);
  },

  async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
  }): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse<LoginResponse>(response);
  }
};

// Companies API
export const companiesAPI = {
  async getAll(): Promise<Company[]> {
    const response = await fetch(`${API_BASE_URL}/companies`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Company[]>(response);
  },

  async create(companyData: {
    name: string;
    price: number;
    change: number;
    marketCap: string;
  }): Promise<Company> {
    const response = await fetch(`${API_BASE_URL}/companies`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(companyData)
    });
    return handleResponse<Company>(response);
  },

  async update(id: number, companyData: Partial<Company>): Promise<Company> {
    const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(companyData)
    });
    return handleResponse<Company>(response);
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to delete company');
    }
  }
};

// Investments API
export const investmentsAPI = {
  async getPortfolio(): Promise<Investment[]> {
    const response = await fetch(`${API_BASE_URL}/investments/portfolio`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Investment[]>(response);
  },

  async create(investmentData: {
    company_id: number;
    amount: number;
  }): Promise<Investment> {
    const response = await fetch(`${API_BASE_URL}/investments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(investmentData)
    });
    return handleResponse<Investment>(response);
  },

  async getTeamAnalytics(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/investments/analytics`, {
      headers: getAuthHeaders()
    });
    return handleResponse<any>(response);
  },

  async getTeamOverview(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/investments/team-overview`, {
      headers: getAuthHeaders()
    });
    return handleResponse<any>(response);
  }
};

// Users API
export const usersAPI = {
  async getAll(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders()
    });
    return handleResponse<User[]>(response);
  },

  async create(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
  }): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse<User>(response);
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  },

  async updateProfile(userData: {
    first_name?: string;
    last_name?: string;
    email?: string;
  }): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse<User>(response);
  }
};

// Sprint API
export const sprintAPI = {
  async end(): Promise<{ message: string; success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/sprint/end`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string; success: boolean }>(response);
  }
};

// Export all APIs
export const api = {
  auth: authAPI,
  companies: companiesAPI,
  investments: investmentsAPI,
  users: usersAPI,
  sprint: sprintAPI
}; 