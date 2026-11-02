import type { APIResponse } from '@playwright/test';
import type { z } from 'zod';

export class ApiResponse {
    readonly status: number;
    readonly headers: Record<string, string>;

    constructor(
        response: APIResponse,
        private readonly text: string,
    ) {
        this.status = response.status();
        this.headers = response.headers();
    }

    textBody(): string {
        return this.text;
    }

    json<T>(schema: z.ZodType<T>): T {
        if (!this.headers['content-type']?.includes('application/json')) {
            throw new Error(`Expected JSON Content-Type, received status ${this.status}.`);
        }
        const body: unknown = JSON.parse(this.text);
        const result = schema.safeParse(body);
        if (!result.success) {
            const issues = result.error.issues.map(
                (issue) => `${issue.path.join('.') || '<root>'}: ${issue.code}`,
            );
            throw new Error(`Response schema mismatch: ${issues.join('; ')}`);
        }
        return result.data;
    }
}
