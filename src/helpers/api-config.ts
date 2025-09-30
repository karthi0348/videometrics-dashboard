import axios, { AxiosInstance } from "axios";

class ApiConfig {

    private baseURL = 'https://videometricsbackend.salmonrock-70d8a746.eastus.azurecontainerapps.io/';


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