import HttpClientWrapper from "@/helpers/http-client-wrapper";

class TemplateApiService {

    private httpClientWrapper: HttpClientWrapper;

    constructor() {
        this.httpClientWrapper = new HttpClientWrapper();
    }

    getAllTemplate  = async (url: any) => {
        try {
            let data: any = await this.httpClientWrapper.get('templates' + url);
            return (data);
        } catch (error) {
            throw error;
        }
    }

    createTemplate = async (payload: any) => {
        try {
            let data: any = await this.httpClientWrapper.post('templates', payload);
            return (data);
        } catch (error) {
            throw error;
        }
    }

    editTemplate = async(id:any, payload:any) => {
        try{
            let data:any= await this.httpClientWrapper.put('templates/'+id, payload );
            return(data);     
        }catch (error){
            throw error;
        }
    }

    deleteTemplate = async(id:any) => {
        try{
            let data:any= await this.httpClientWrapper.delete('ambulance-management-services/ambulance_vehicle/delete/'+id );
            return(data);     
        }catch (error){
            throw error;
        }
    }
    
}
export default TemplateApiService;