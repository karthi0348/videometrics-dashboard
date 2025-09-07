import axios, { AxiosInstance } from "axios";

class ApiConfig {
    private baseURL = process.env.NODE_ENV === 'production' 
        ? '/api/' 
        : 'http://172.174.114.7:8000/';

    private apiBaseUrl: string;

    constructor() {
        this.apiBaseUrl = this.baseURL;
    }

    private getApiBaseURL = () => {
        return this.apiBaseUrl;
    }

    public getAxiosInstance = (): AxiosInstance => {
        const api = axios.create({ 
            baseURL: this.getApiBaseURL(),
            timeout: 30000 // 30 second timeout
        });
        
        // Add request interceptor to automatically add auth token
        api.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('accessToken');
                console.log('Interceptor - Token found:', !!token); // Debug log
                
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                    console.log('Interceptor - Auth header added'); // Debug log
                }
                
                return config;
            },
            (error) => {
                console.error('Request interceptor error:', error);
                return Promise.reject(error);
            }
        );

        // Add response interceptor for better error handling
        api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    console.log('401 Unauthorized - clearing tokens');
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('user');
                }
                return Promise.reject(error);
            }
        );

        return api;
    }
}

export default ApiConfig;