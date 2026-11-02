import { expect, type APIRequestContext } from '@playwright/test';
import type { Book } from '../models/book';
import type { UserCredentials } from '../models/user-credentials';
import { ApiClient } from './api-client';
import { accountResponseSchema, loginResponseSchema } from './book-collection-schema';

type Session = {
    userId: string;
    token: string;
};

export class BookCollectionApi {
    private constructor(
        private readonly client: ApiClient,
        private readonly session: Session,
    ) {}

    static async authenticate(request: APIRequestContext, credentials: UserCredentials) {
        const client = new ApiClient(request);
        const response = await client.send('/Account/v1/Login', {
            method: 'POST',
            data: { userName: credentials.username, password: credentials.password },
        });
        // Check status without including the login response, which contains credentials.
        expect(response.status, 'API login should succeed').toBe(200);
        const { userId, token } = response.json(loginResponseSchema);

        return new BookCollectionApi(client, { userId, token });
    }

    async addBooks(books: readonly Book[]) {
        const response = await this.client.send('/BookStore/v1/Books', {
            method: 'POST',
            headers: this.authorization,
            data: {
                userId: this.session.userId,
                collectionOfIsbns: books.map((book) => ({ isbn: book.isbn })),
            },
        });
        expect(response.status, 'Adding books through the API should succeed').toBe(201);
        await expect
            .poll(() => this.getBookIsbns(), { message: 'Added books should be persisted' })
            .toEqual(expect.arrayContaining(books.map((book) => book.isbn)));
    }

    async clearBooks() {
        const response = await this.client.send('/BookStore/v1/Books', {
            method: 'DELETE',
            headers: this.authorization,
            params: { UserId: this.session.userId },
        });
        expect(response.status, 'Clearing books through the API should succeed').toBe(204);
        await expect
            .poll(() => this.getBookIsbns(), { message: 'The account collection should be empty' })
            .toEqual([]);
    }

    private get authorization() {
        return { Authorization: `Bearer ${this.session.token}` };
    }

    private async getBookIsbns(): Promise<string[]> {
        const response = await this.client.send(`/Account/v1/User/${this.session.userId}`, {
            method: 'GET',
            headers: this.authorization,
        });
        expect(response.status, 'Reading the account collection should succeed').toBe(200);
        return response.json(accountResponseSchema).books.map((book) => book.isbn);
    }
}
