import { test as base, expect } from '@playwright/test';
import { ApiClient } from '../api client/api-client';
import { AuthService } from '../Services/auth-service';
import { BookingService } from '../Services/booking-service';
import { HealthService } from '../Services/health-service';
import { authTokenSchema } from '../Schema/auth';
import { getCredentials, getEnvironment } from '../utils/environment';

type Fixtures = {
    authToken: string;
    auth: AuthService;
    health: HealthService;
    bookings: BookingService;
    authenticatedBookings: BookingService;
    invalidTokenBookings: BookingService;
};

// Deletes one owned booking and reports exactly what went wrong, if anything.
// Returns null when the booking is already gone or was removed successfully.
async function cleanupCreatedBooking(
    id: number,
    anonymous: BookingService,
    authenticated: BookingService,
): Promise<string | null> {
    const existing = await anonymous.get(id);
    if (existing.status === 404) {
        return null;
    }
    if (existing.status !== 200) {
        return `Booking ${id}: cleanup read returned ${existing.status}`;
    }

    const deleted = await authenticated.delete(id);
    if (deleted.status !== 201) {
        return `Booking ${id}: cleanup delete returned ${deleted.status}`;
    }

    const absent = await anonymous.get(id);
    if (absent.status !== 404) {
        return `Booking ${id}: still readable after cleanup (${absent.status})`;
    }

    return null;
}

export const test = base.extend<Fixtures>({
    authToken: async ({ playwright }, use) => {
        const context = await playwright.request.newContext({
            baseURL: getEnvironment().baseURL,
            timeout: 15_000,
        });
        try {
            const response = await new AuthService(new ApiClient(context)).createToken(
                getCredentials(),
            );
            expect(response.status, 'Authenticate cleanup client').toBe(200);
            await use(response.json(authTokenSchema).token);
        } finally {
            await context.dispose();
        }
    },
    auth: async ({ request }, use) => {
        await use(new AuthService(new ApiClient(request)));
    },
    health: async ({ request }, use) => {
        await use(new HealthService(new ApiClient(request)));
    },
    authenticatedBookings: async ({ request, authToken }, use) => {
        await use(new BookingService(new ApiClient(request, authToken)));
    },
    invalidTokenBookings: async ({ request }, use) => {
        await use(new BookingService(new ApiClient(request, 'intentionally-invalid-token')));
    },
    bookings: async ({ request, authenticatedBookings }, use) => {
        const service = new BookingService(new ApiClient(request));
        try {
            await use(service);
        } finally {
            const failures: string[] = [];
            for (const id of service.createdIds) {
                const failure = await cleanupCreatedBooking(id, service, authenticatedBookings);
                if (failure) {
                    failures.push(failure);
                }
            }
            expect(failures, 'Cleanup must remove only bookings created by this test').toEqual([]);
        }
    },
});

export { expect };
