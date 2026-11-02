import { z } from 'zod';

export const authTokenSchema = z.strictObject({
    token: z.string().min(1),
});

export const authFailureSchema = z.strictObject({
    reason: z.literal('Bad credentials'),
});
