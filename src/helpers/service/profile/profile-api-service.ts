import HttpClientWrapper from "@/helpers/http-client-wrapper";

class ProfileApiService {

    private httpClientWrapper: HttpClientWrapper;

    constructor() {
        this.httpClientWrapper = new HttpClientWrapper();
    }

    getAllProfile = async (url: any) => {
        try {
            let data: any = await this.httpClientWrapper.get('profiles' + url);
            return (data);
        } catch (error) {
            throw error;
        }
    }

}
export default ProfileApiService;