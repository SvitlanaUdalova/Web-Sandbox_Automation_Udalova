import { expect } from '@playwright/test';
import type { z } from 'zod';
import type { ApiResponse } from '../api client/api-response';

export function expectJson<T>(response: ApiResponse, schema: z.ZodType<T>, status = 200): T {
    expect(response.status, 'HTTP status').toBe(status);
    expect(response.headers['content-type'], 'JSON Content-Type').toContain('application/json');
    return response.json(schema);
}

export function expectText(response: ApiResponse, status: number, body: string) {
    expect(response.status, 'HTTP status').toBe(status);
    expect(response.headers['content-type'], 'Text Content-Type').toContain('text/plain');
    expect(response.textBody(), 'Response text').toBe(body);
}
