export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T | undefined;
}

export interface ErrorResponse {
    success: false;
    message: string;
    error?: {
        code: string;
    };
}