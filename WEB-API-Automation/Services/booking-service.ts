import { ApiClient } from '../api client/api-client';
import type { ApiResponse } from '../api client/api-response';
import type { Booking, BookingFilters } from '../Models/booking';
import { bookingIdSchema } from '../Schema/booking';

export class BookingService {
    readonly createdIds = new Set<number>();

    constructor(private readonly client: ApiClient) {}

    list(filters: BookingFilters = {}) {
        return this.client.send('/booking', { method: 'GET', params: { ...filters } });
    }

    get(id: number, accept = 'application/json') {
        return this.client.send(`/booking/${id}`, {
            method: 'GET',
            headers: { Accept: accept },
        });
    }

    async create(booking: Booking) {
        const response = await this.client.send('/booking', {
            method: 'POST',
            data: booking,
        });
        this.trackCreatedId(response);
        return response;
    }

    replace(id: number, booking: Booking) {
        return this.client.send(`/booking/${id}`, { method: 'PUT', data: booking });
    }

    update(id: number, changes: Partial<Booking>) {
        return this.client.send(`/booking/${id}`, { method: 'PATCH', data: changes });
    }

    delete(id: number) {
        return this.client.send(`/booking/${id}`, { method: 'DELETE' });
    }

    // Sends a payload that does not necessarily satisfy the Booking type, to exercise
    // the live API's handling of missing fields, invalid formats and wrong Content-Type.
    async createUnvalidated(body: unknown, headers: Record<string, string> = {}) {
        const response = await this.client.send('/booking', {
            method: 'POST',
            data: body,
            headers,
        });
        this.trackCreatedId(response);
        return response;
    }

    // Shared by create() and createUnvalidated(): tracks the new booking id for
    // cleanup whenever the response is a schema-valid 200, and silently skips
    // tracking otherwise. A missed id here still fails the test loudly, either via
    // this.client's own schema-strict callers or via the test's own assertions.
    private trackCreatedId(response: ApiResponse) {
        if (response.status !== 200 || !response.headers['content-type']?.includes('json')) {
            return;
        }
        const parsed = bookingIdSchema.safeParse(JSON.parse(response.textBody()));
        if (parsed.success) {
            this.createdIds.add(parsed.data.bookingid);
        }
    }
}
