import { ApiClient } from '../api client/api-client';

export class HealthService {
    constructor(private readonly client: ApiClient) {}

    ping() {
        return this.client.send('/ping', { method: 'GET' });
    }
}
