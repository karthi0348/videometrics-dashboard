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
        const api = axios.create({ baseURL: this.getApiBaseURL() });
        return api;
    }
}

export default ApiConfig;