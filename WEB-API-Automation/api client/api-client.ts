import type { APIRequestContext } from '@playwright/test';
import { ApiResponse } from './api-response';

type RequestOptions = {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    data?: unknown;
    params?: Record<string, string>;
    headers?: Record<string, string>;
};

export class ApiClient {
    constructor(
        private readonly context: APIRequestContext,
        private readonly token?: string,
    ) {}

    async send(path: string, options: RequestOptions): Promise<ApiResponse> {
        const response = await this.context.fetch(path, {
            ...options,
            headers: {
                Accept: 'application/json',
                ...(this.token ? { Cookie: `token=${this.token}` } : {}),
                ...options.headers,
            },
            failOnStatusCode: false,
            maxRetries: 0,
            maxRedirects: 0,
        });
        const text = await response.text();
        const result = new ApiResponse(response, text);
        await response.dispose();
        return result;
    }
}
