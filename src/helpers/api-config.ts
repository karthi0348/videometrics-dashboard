import axios, { AxiosInstance } from "axios";

class ApiConfig {

    private baseURL = 'http://172.174.114.7:8000/';
    // private baseURL = 'http://localhost:8087/';
    // private baseURL = 'http://192.168.29.200:8764/' // Local
    // private baseURL = 'https://13.233.24.223:8443/'; 
    // private baseURL = 'https://backend.hmsideauxtech.com/' // stage

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