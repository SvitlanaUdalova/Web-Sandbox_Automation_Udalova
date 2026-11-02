import type { z } from 'zod';
import type { authFailureSchema, authTokenSchema } from '../Schema/auth';

// Request body for POST /auth. This is a request shape, not a response body,
// so there is no schema to derive it from.
export interface Credentials {
    username: string;
    password: string;
}

// Derived from the response schemas below, which are this project's single
// source of truth for these shapes.
export type AuthToken = z.infer<typeof authTokenSchema>;
export type AuthFailure = z.infer<typeof authFailureSchema>;
