import { AxiosInstance, AxiosResponse, AxiosRequestConfig } from "axios";
import ApiConfig from "./api-config";

// Define interfaces for better type safety
interface HeaderConfig {
    headers: Record<string, string>;
}

interface ApiResponseData<T = unknown> {
    data: T;
    message?: string;
    success?: boolean;
}

class HttpClientWrapper {
    private axiosClient: AxiosInstance;

    constructor() {
        this.axiosClient = new ApiConfig().getAxiosInstance();
    }

    public post = async <T = unknown>(path: string, payload: unknown): Promise<T> => {
        try {
            const response: AxiosResponse<T> = await this.axiosClient.post(path, payload, this.getJsonHeaderConfig());
            return response.data;
        } catch (err: unknown) {
            throw err;
        }
    }

    public postWithoutAuth = async <T = unknown>(path: string, payload: unknown): Promise<T> => {
        try {
            const response: AxiosResponse<T> = await this.axiosClient.post(path, payload, this.getJsonHeaderConfigWithoutAuth());
            return response.data;
        } catch (err: unknown) {
            throw err;
        }
    }

    public get = async <T = unknown>(path: string, payload?: unknown): Promise<T> => {
        try {
            const response: AxiosResponse<T> = await this.axiosClient.get(path, this.getJsonHeaderConfig());
            return response.data;
        } catch (err: unknown) {
            throw err;
        }
    }

    public getWithoutAuth = async <T = unknown>(path: string, payload?: unknown): Promise<T> => {
        try {
            const response: AxiosResponse<T> = await this.axiosClient.get(path, this.getJsonHeaderConfigWithoutAuth());
            return response.data;
        } catch (err: unknown) {
            throw err;
        }
    }

    public download = async <T = unknown>(path: string, isBlob: boolean = false): Promise<T> => {
        try {
            const config: AxiosRequestConfig = this.getJsonHeaderConfig();
            if (isBlob) {
                config.responseType = 'blob';
            }
            const response: AxiosResponse<T> = await this.axiosClient.get(path, config);
            return response.data;
        } catch (err: unknown) {
            throw err;
        }
    };

    public postBy = async <T = unknown>(path: string): Promise<T> => {
        try {
            const response: AxiosResponse<T> = await this.axiosClient.post(path, '', this.getJsonHeaderConfig());
            return response.data;
        } catch (err: unknown) {
            throw err;
        }
    }

    public put = async <T = unknown>(path: string, payload?: unknown): Promise<T> => {
        try {
            const response: AxiosResponse<ApiResponseData<T>> = await this.axiosClient.put(path, payload, this.getJsonHeaderConfig());
            return response.data.data;
        } catch (err: unknown) {
            throw err;
        }
    }

    public putWithoutAuth = async <T = unknown>(path: string, payload?: unknown): Promise<T> => {
        try {
            const response: AxiosResponse<ApiResponseData<T>> = await this.axiosClient.put(path, payload, this.getJsonHeaderConfigWithoutAuth());
            return response.data.data;
        } catch (err: unknown) {
            throw err;
        }
    }

    public patch = async <T = unknown>(path: string, payload?: unknown): Promise<T> => {
        try {
            const response: AxiosResponse<ApiResponseData<T>> = await this.axiosClient.patch(path, payload, this.getJsonHeaderConfig());
            return response.data.data;
        } catch (err: unknown) {
            throw err;
        }
    }

    public patchFormData = async <T = unknown>(path: string, formData: FormData): Promise<T> => {
        try {
            const response: AxiosResponse<T> = await this.axiosClient.patch(path, formData, this.getFormDataHeaderConfig());
            return response.data;
        } catch (err: unknown) {
            throw err;
        }
    }

    public delete = async <T = unknown>(path: string): Promise<T> => {
        try {
            const response: AxiosResponse<ApiResponseData<T>> = await this.axiosClient.delete(path, this.getJsonHeaderConfig());
            return response.data.data;
        } catch (err: unknown) {
            throw err;
        }
    }

    public postFormData = async <T = unknown>(path: string, formData: FormData): Promise<T> => {
        try {
            const response: AxiosResponse<T> = await this.axiosClient.post(path, formData, this.getFormDataHeaderConfig());
            return response.data;
        } catch (err: unknown) {
            throw err;
        }
    }

    public postFormDataWithoutAuth = async <T = unknown>(path: string, formData: FormData): Promise<T> => {
        try {
            const response: AxiosResponse<T> = await this.axiosClient.post(path, formData, this.getFormDataHeaderConfigWithoutAuth());
            return response.data;
        } catch (err: unknown) {
            throw err;
        }
    }

    public putFormData = async <T = unknown>(path: string, formData: FormData): Promise<T> => {
        try {
            const response: AxiosResponse<T> = await this.axiosClient.put(path, formData, this.getFormDataHeaderConfig());
            return response.data;
        } catch (err: unknown) {
            throw err;
        }
    }

    public putFormDataWithoutAuth = async <T = unknown>(path: string, formData: FormData): Promise<T> => {
        try {
            const response: AxiosResponse<T> = await this.axiosClient.put(path, formData, this.getFormDataHeaderConfigWithoutAuth());
            return response.data;
        } catch (err: unknown) {
            throw err;
        }
    }

    public doLogout = async <T = unknown>(path: string): Promise<T> => {
        try {
            const response: AxiosResponse<T> = await this.axiosClient.post(path, '', this.getJsonHeaderConfigWithAuth());
            return response.data;
        } catch (err: unknown) {
            throw err;
        }
    }

    getFormDataHeaderConfig = (): HeaderConfig => {
        return this.getHeaderConfigWithAuth('multipart/form-data');
    }

    getHeaderConfig = (contentType: string): HeaderConfig => {
        const headers: Record<string, string> = {};
        headers['Content-Type'] = contentType;
        return { headers: headers }
    }

    getJsonHeaderConfig = (): HeaderConfig => {
        return this.getHeaderConfigWithAuth('application/json');
    }

    getJsonHeaderConfigWithoutAuth = (): HeaderConfig => {
        return this.getHeaderConfig('application/json');
    }

    getFormDataHeaderConfigWithoutAuth = (): HeaderConfig => {
        return this.getHeaderConfig('multipart/form-data');
    }

    getHeaderConfigWithAuth = (contentType: string): HeaderConfig => {
        const headers: Record<string, string> = {};
        headers['Content-Type'] = contentType;
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            const token = accessToken;
            if (token) {
                headers['Authorization'] = 'Bearer ' + token;
            }
        }
        return { headers: headers }
    }

    getJsonHeaderConfigWithAuth = (): HeaderConfig => {
        return this.getHeaderConfigWithAuth('application/json');
    }
}

export default HttpClientWrapper;