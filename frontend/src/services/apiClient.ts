export interface ApiResponse<T = any> {
    status?: number;
    data?: T;
    error?: string;
    success: boolean;
    message?: string;
  }
  
  class ApiClient {
    private baseURL: string;
  
    constructor() {
      this.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/";
    }
  
    getBaseURL() {
      return this.baseURL;
    }
  
    async request<T = any>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
      try {
        const url = `${this.baseURL}${endpoint}`;
        const token = localStorage.getItem("auth_token");
        const isFormData = options.body instanceof FormData;
  
        const defaultHeaders: HeadersInit = {};
        if (!isFormData) {
          defaultHeaders["Content-Type"] = "application/json";
        }
        if (token) {
          defaultHeaders["Authorization"] = `Bearer ${token}`;
        }
  
        const config: RequestInit = {
          ...options,
          headers: {
            ...defaultHeaders,
            ...options.headers,
          },
        };
  
        const response = await fetch(url, config);
        const data = await response.json();
  
        if (!response.ok) {
          return {
            success: false,
            error: data.message || "An error occurred",
            status: response.status,
          };
        }
  
        return {
          success: true,
          data,
          status: response.status,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message || "Network error",
        };
      }
    }
  }
  
  const apiClient = new ApiClient();
  export default apiClient;
  