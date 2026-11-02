import type { APIRequestContext } from '@playwright/test';
import { test } from '@playwright/test';
import { ApiResponse } from './api-response';

type RequestOptions = {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    data?: unknown;
    params?: Record<string, string>;
    headers?: Record<string, string>;
};

// Authorization and Cookie both carry the bearer token or Basic auth value;
// neither may appear in the attached request/response report.
const SENSITIVE_HEADER_NAMES = new Set(['authorization', 'cookie']);

// These field names carry credentials or tokens wherever they appear in a
// request or response body (e.g. the /auth request body and its response).
// Redacted regardless of nesting depth, so a future endpoint that nests one
// of these fields is covered without further changes here.
const SENSITIVE_BODY_FIELD_NAMES = new Set(['username', 'password', 'token']);

function redactHeaders(headers: Record<string, string>): Record<string, string> {
    const redacted: Record<string, string> = {};
    for (const [name, value] of Object.entries(headers)) {
        redacted[name] = SENSITIVE_HEADER_NAMES.has(name.toLowerCase()) ? '<redacted>' : value;
    }
    return redacted;
}

function redactBody(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(redactBody);
    }
    if (value !== null && typeof value === 'object') {
        const redacted: Record<string, unknown> = {};
        for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
            redacted[key] = SENSITIVE_BODY_FIELD_NAMES.has(key.toLowerCase())
                ? '<redacted>'
                : redactBody(nested);
        }
        return redacted;
    }
    return value;
}

function parseBodyForReport(text: string): unknown {
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

export class ApiClient {
    constructor(
        private readonly context: APIRequestContext,
        private readonly token?: string,
    ) {}

    async send(path: string, options: RequestOptions): Promise<ApiResponse> {
        const headers = {
            Accept: 'application/json',
            ...(this.token ? { Cookie: `token=${this.token}` } : {}),
            ...options.headers,
        };

        const response = await this.context.fetch(path, {
            ...options,
            headers,
            failOnStatusCode: false,
            maxRetries: 0,
            maxRedirects: 0,
        });
        const text = await response.text();
        const result = new ApiResponse(response, text);
        await response.dispose();

        await this.attachToReport(
            { method: options.method, path, params: options.params, headers, body: options.data },
            result,
        );

        return result;
    }

    // Attaches the redacted request and response to the HTML report for every
    // call, so a reviewer can inspect exactly what was sent and received for
    // each step without re-running the suite. Playwright trace is intentionally
    // off elsewhere in this project to avoid persisting tokens; this redacted
    // attachment is the durable request/response evidence in the report instead.
    private async attachToReport(
        request: {
            method: string;
            path: string;
            params?: Record<string, string>;
            headers: Record<string, string>;
            body?: unknown;
        },
        response: ApiResponse,
    ) {
        const entry = {
            request: {
                method: request.method,
                url: request.path,
                params: request.params,
                headers: redactHeaders(request.headers),
                body: redactBody(request.body),
            },
            response: {
                status: response.status,
                headers: redactHeaders(response.headers),
                body: redactBody(parseBodyForReport(response.textBody())),
            },
        };

        await test.info().attach(`${request.method} ${request.path} -> ${response.status}`, {
            body: JSON.stringify(entry, null, 2),
            contentType: 'application/json',
        });
    }
}
