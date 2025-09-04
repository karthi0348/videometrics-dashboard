import HttpClientWrapper from "@/helpers/http-client-wrapper";

class DashboardApiService {

    private httpClientWrapper: HttpClientWrapper;

    constructor() {
        this.httpClientWrapper = new HttpClientWrapper();
    }

    getDashboardStats = async () => {
        try {
            let data: any = await this.httpClientWrapper.get('/dashboard/stats');
            return (data);
        } catch (error) {
            throw error;
        }
    }

}
export default DashboardApiService;