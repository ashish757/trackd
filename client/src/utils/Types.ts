export interface ApiError {
    data?: {
        message?: string;
        error?: string;
    };
    message?: string;
}