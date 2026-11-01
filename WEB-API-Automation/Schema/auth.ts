import { z } from 'zod';
import type { AuthFailure, AuthToken } from '../Models/auth';

export const authTokenSchema = z.strictObject({
    token: z.string().min(1),
}) satisfies z.ZodType<AuthToken>;

export const authFailureSchema = z.strictObject({
    reason: z.literal('Bad credentials'),
}) satisfies z.ZodType<AuthFailure>;
