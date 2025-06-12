import { BASE_URL, API_CONFIG, buildUrl } from './config';

class ApiService {
  constructor() {
    this.baseURL = BASE_URL;
    this.timeout = API_CONFIG.timeout;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : buildUrl(endpoint);
    
    const config = {
      method: 'GET',
      headers: {
        ...API_CONFIG.headers,
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = await this.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      console.log(`Making ${config.method} request to: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      if (error.message.includes('Network request failed')) {
        throw new Error('Network error. Please check your connection.');
      }
      
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = Object.keys(params).length > 0 
      ? '?' + new URLSearchParams(params).toString()
      : '';
    
    return this.request(`${endpoint}${queryString}`);
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Multipart form request (for file uploads)
  async postFormData(endpoint, formData) {
    const token = await this.getAuthToken();
    const headers = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return this.request(endpoint, {
      method: 'POST',
      headers,
      body: formData,
    });
  }

  // Get auth token from storage
  async getAuthToken() {
    try {
      // Replace this with your actual token storage method
      // For React Native, you might use AsyncStorage
      // const token = await AsyncStorage.getItem('authToken');
      // return token;
      return null; // Placeholder
    // eslint-disable-next-line no-unreachable
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Set auth token
  async setAuthToken(token) {
    try {
      // Replace this with your actual token storage method
      // await AsyncStorage.setItem('authToken', token);
      console.log('Auth token set'); // Placeholder
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

  // Remove auth token
  async removeAuthToken() {
    try {
      // Replace this with your actual token storage method
      // await AsyncStorage.removeItem('authToken');
      console.log('Auth token removed'); // Placeholder
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.get('/health');
      console.log('Health check successful:', response);
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();

// Export individual methods for convenience
export const {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
  postFormData: apiPostFormData,
  healthCheck: apiHealthCheck,
} = apiService;
