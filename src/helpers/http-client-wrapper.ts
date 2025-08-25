import { AxiosInstance } from "axios";
import ApiConfig from "./api-config";

class HttpClientWrapper {

    private axiosClient: AxiosInstance;

    constructor() {
        this.axiosClient = new ApiConfig().getAxiosInstance();
    }

    public post = async (path: string, payload: any) => {
        try {
            let response: any = await this.axiosClient.post(path, payload, this.getJsonHeaderConfig());
            return response;
        } catch (err: any) {
            throw err;
        }
    }

    public postWithoutAuth = async (path: string, payload: any) => {
        try {
            let response: any = await this.axiosClient.post(path, payload, this.getJsonHeaderConfigWithoutAuth());
            return response;
        } catch (err: any) {
            throw err;
        }
    }

    public get = async (path: string, payload?: any) => {
        try {
            let response: any = await this.axiosClient.get(path, this.getJsonHeaderConfig());
            return response.data;
        } catch (err: any) {
            throw err;
        }
    }

    public getWithoutAuth = async (path: string, payload?: any) => {
        try {
            let response: any = await this.axiosClient.get(path, this.getJsonHeaderConfigWithoutAuth());
            return response.data;
        } catch (err: any) {
            throw err;
        }
    }

    public download = async (path: string, isBlob: boolean = false) => {
        try {
            const config: any = this.getJsonHeaderConfig();
            if (isBlob) {
                config.responseType = 'blob';
            }
            const response = await this.axiosClient.get(path, config);
            return response.data;
        } catch (err: any) {
            throw err;
        }
    };

    public postBy = async (path: string) => {
        try {
            let response: any = await this.axiosClient.post(path, '', this.getJsonHeaderConfig());
            return response;
        } catch (err: any) {
            throw err;
        }
    }

    public put = async (path: string, payload?: any) => {
        try {
            let response: any = await this.axiosClient.put(path, payload, this.getJsonHeaderConfig());
            return response.data.data;
        } catch (err: any) {
            throw err;
        }
    }

    public putWithoutAuth = async (path: string, payload?: any) => {
        try {
            let response: any = await this.axiosClient.put(path, payload, this.getJsonHeaderConfigWithoutAuth());
            return response.data.data;
        } catch (err: any) {
            throw err;
        }
    }


    public patch = async (path: string, payload?: any) => {
        try {
            let response: any = await this.axiosClient.patch(path, payload, this.getJsonHeaderConfig());
            return response.data.data;
        } catch (err: any) {
            throw err;
        }
    }

    public patchFormData = async (path: string, formData: FormData) => {
        try {
            let response: any = await this.axiosClient.patch(path, formData, this.getFormDataHeaderConfig());
            return response.data;
        } catch (err: any) {
            throw err;
        }
    }

    public delete = async (path: string) => {
        try {
            let response: any = await this.axiosClient.delete(path, this.getJsonHeaderConfig());
            return response.data.data;
        } catch (err: any) {
            throw err;
        }
    }

    public postFormData = async (path: string, formData: FormData) => {
        try {
            let response: any = await this.axiosClient.post(path, formData, this.getFormDataHeaderConfig());
            return response.data;
        } catch (err: any) {
            throw err;
        }
    }

    public postFormDataWithoutAuth = async (path: string, formData: FormData) => {
        try {
            let response: any = await this.axiosClient.post(path, formData, this.getFormDataHeaderConfigWithoutAuth());
            return response.data;
        } catch (err: any) {
            throw err;
        }
    }

    public putFormData = async (path: string, formData: FormData) => {
        try {
            let response: any = await this.axiosClient.put(path, formData, this.getFormDataHeaderConfig());
            return response.data;
        } catch (err: any) {
            throw err;
        }
    }

    public putFormDataWithoutAuth = async (path: string, formData: FormData) => {
        try {
            let response: any = await this.axiosClient.put(path, formData, this.getFormDataHeaderConfigWithoutAuth());
            return response.data;
        } catch (err: any) {
            throw err;
        }
    }

    public doLogout = async (path: string) => {
        try {
            let response: any = await this.axiosClient.post(path, '', this.getJsonHeaderConfigWithAuth());
            return response;
        } catch (err: any) {
            throw err;
        }
    }

    getFormDataHeaderConfig = () => {
        return this.getHeaderConfigWithAuth('multipart/form-data');
    }

    getHeaderConfig = (contentType: string) => {
        let headers: any = {};
        headers['Content-Type'] = contentType;
        return { headers: headers }
    }

    getJsonHeaderConfig = () => {
        return this.getHeaderConfigWithAuth('application/json');
    }

    getJsonHeaderConfigWithoutAuth = () => {
        return this.getHeaderConfig('application/json');
    }

    getFormDataHeaderConfigWithoutAuth = () => {
        return this.getHeaderConfig('multipart/form-data');
    }

    getHeaderConfigWithAuth = (contentType: string) => {
        let headers: any = {};
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

    getJsonHeaderConfigWithAuth = () => {
        return this.getHeaderConfigWithAuth('application/json');
    }
}
export default HttpClientWrapper;