import { AxiosError } from "axios";
import { toast } from "react-toastify";

const ErrorHandler = (error: AxiosError) => {
    if (error.response) {
        if (error.response.data) {
            const data: any = error.response.data;
            if (typeof data === 'object') {
                const errorMessages = (data.message || data.error);
                toast.error(errorMessages, { containerId: 'TR' });
            } else {
                toast.error(data, { containerId: 'TR' });
            }
        }else {
            toast.error('An unexpected server error occurred.', { containerId: 'TR' });
        }
    } else if (error.request) {
        // toast.error('No response from server', { containerId: 'TR' });
    } else {
        toast.error(error.message, { containerId: 'TR' });
    }
}

export default ErrorHandler
