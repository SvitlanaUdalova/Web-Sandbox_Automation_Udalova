import { ApiClient } from '../api client/api-client';
import type { Credentials } from '../Models/auth';

export class AuthService {
    constructor(private readonly client: ApiClient) {}

    createToken(credentials: Partial<Credentials>) {
        return this.client.send('/auth', { method: 'POST', data: credentials });
    }
}
