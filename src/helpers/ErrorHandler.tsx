import { AxiosError } from "axios";
import { toast } from "react-toastify";

// Define interfaces for better type safety
interface ErrorResponse {
    message?: string;
    error?: {
        message?: string;
    };
    detail?: string;
    // Add other common error response properties as needed
}

const ErrorHandler = (error: AxiosError<ErrorResponse>): void => {
    if (error.response) {
        if (error.response.data) {
            const data = error.response.data;
            if (typeof data === 'object' && data !== null) {
                const errorMessages = (data.error?.message || data.message || data.detail);
                if (errorMessages) {
                    toast.error(errorMessages, { containerId: 'TR' });
                } else {
                    toast.error('An error occurred', { containerId: 'TR' });
                }
            } else {
                toast.error(String(data), { containerId: 'TR' });
            }
        } else {
            toast.error('An unexpected server error occurred.', { containerId: 'TR' });
        }
    } else if (error.request) {
        // toast.error('No response from server', { containerId: 'TR' });
    } else {
        toast.error(error.message, { containerId: 'TR' });
    }
}

export default ErrorHandler;