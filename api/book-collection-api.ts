import { expect, type APIRequestContext } from '@playwright/test';
import type { Book } from '../models/book';
import type { UserCredentials } from '../models/user-credentials';

type Session = {
    userId: string;
    token: string;
};

export class BookCollectionApi {
    private constructor(
        private request: APIRequestContext,
        private session: Session,
    ) {}

    static async authenticate(request: APIRequestContext, credentials: UserCredentials) {
        const response = await request.post('/Account/v1/Login', {
            data: { userName: credentials.username, password: credentials.password },
        });
        // Check status without including the login response, which contains credentials.
        expect(response.status(), 'API login should succeed').toBe(200);
        const body: unknown = await response.json();
        if (
            typeof body !== 'object' ||
            body === null ||
            !('userId' in body) ||
            typeof body.userId !== 'string' ||
            !body.userId ||
            !('token' in body) ||
            typeof body.token !== 'string' ||
            !body.token
        ) {
            throw new Error('API login response must contain a userId and token.');
        }

        return new BookCollectionApi(request, { userId: body.userId, token: body.token });
    }

    async addBooks(books: readonly Book[]) {
        const response = await this.request.post('/BookStore/v1/Books', {
            headers: this.authorization,
            data: {
                userId: this.session.userId,
                collectionOfIsbns: books.map((book) => ({ isbn: book.isbn })),
            },
        });
        expect(response.status(), 'Adding books through the API should succeed').toBe(201);
        await expect
            .poll(() => this.getBookIsbns(), { message: 'Added books should be persisted' })
            .toEqual(expect.arrayContaining(books.map((book) => book.isbn)));
    }

    async clearBooks() {
        const response = await this.request.delete('/BookStore/v1/Books', {
            headers: this.authorization,
            params: { UserId: this.session.userId },
        });
        expect(response.status(), 'Clearing books through the API should succeed').toBe(204);
        await expect
            .poll(() => this.getBookIsbns(), { message: 'The account collection should be empty' })
            .toEqual([]);
    }

    private get authorization() {
        return { Authorization: `Bearer ${this.session.token}` };
    }

    private async getBookIsbns(): Promise<string[]> {
        const response = await this.request.get(`/Account/v1/User/${this.session.userId}`, {
            headers: this.authorization,
        });
        expect(response.status(), 'Reading the account collection should succeed').toBe(200);
        const body: unknown = await response.json();
        if (
            typeof body !== 'object' ||
            body === null ||
            !('books' in body) ||
            !Array.isArray(body.books)
        ) {
            throw new Error('Account response must contain a books array.');
        }

        return body.books.map((book: unknown) => {
            if (
                typeof book !== 'object' ||
                book === null ||
                !('isbn' in book) ||
                typeof book.isbn !== 'string' ||
                !book.isbn
            ) {
                throw new Error('Each account book must contain an ISBN.');
            }
            return book.isbn;
        });
    }
}
