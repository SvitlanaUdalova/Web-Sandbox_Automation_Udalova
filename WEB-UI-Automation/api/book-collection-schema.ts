import { z } from 'zod';

// DemoQA's login response includes additional account/session fields beyond
// userId and token; this schema intentionally stays non-strict so it does not
// assert on fields this project does not use.
export const loginResponseSchema = z.object({
    userId: z.string().min(1),
    token: z.string().min(1),
});

export const accountResponseSchema = z.object({
    books: z.array(z.object({ isbn: z.string().min(1) })),
});
