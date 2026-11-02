import { test, expect } from '../fixtures/fixtures';
import { expectJson, expectText } from '../utils/assertions';
import { createdBookingSchema } from '../Schema/booking';
import { buildBooking } from '../test data/booking-factory';

// Covers the "missing fields" and "invalid formats" negative categories, and the
// Junior-stage requirement to observe behavior for a missing/wrong Content-Type.
// Every status/body below is live-observed, not assumed from generic REST conventions.
test.describe('Booking creation input validation', { tag: '@regression' }, () => {
    test('API-NEG-010: missing a required field causes a server error', async ({ bookings }) => {
        const { totalprice, ...payloadWithoutPrice } = buildBooking();

        const response = await bookings.createUnvalidated(payloadWithoutPrice, {
            'Content-Type': 'application/json',
        });

        expectText(response, 500, 'Internal Server Error');
    });

    test('API-NEG-011: wrong Content-Type on creation causes a server error', async ({
        bookings,
    }) => {
        const payload = buildBooking();

        const response = await bookings.createUnvalidated(payload, {
            'Content-Type': 'text/plain',
        });

        expectText(response, 500, 'Internal Server Error');
    });

    test('API-NEG-012: malformed JSON syntax is rejected distinctly from missing fields', async ({
        bookings,
    }) => {
        const response = await bookings.createUnvalidated('{not valid json', {
            'Content-Type': 'application/json',
        });

        // Status differs from the missing-field case above (400 vs 500): the server
        // distinguishes unparsable request bodies from structurally valid-but-incomplete ones.
        expectText(response, 400, 'Bad Request');
    });

    test('API-SCHEMA-003: an invalid check-in date is accepted and corrupted', async ({
        bookings,
    }) => {
        const payload = buildBooking({
            bookingdates: { checkin: 'not-a-date', checkout: '2031-02-02' },
        });

        const response = await bookings.create(payload);
        expect(response.status, 'HTTP status').toBe(200);
        expect(response.headers['content-type'], 'JSON Content-Type').toContain('application/json');

        const raw = JSON.parse(response.textBody()) as {
            booking: { bookingdates: { checkin: unknown } };
        };
        const persistedCheckin = raw.booking.bookingdates.checkin;
        expect(
            typeof persistedCheckin === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(persistedCheckin),
            'Persisted checkin matches the documented CCYY-MM-DD format',
        ).toBe(false);

        test.fail(
            true,
            'RB-003: an invalid check-in date is accepted instead of rejected, and the ' +
                'persisted representation does not conform to the documented date format.',
        );
        expectJson(response, createdBookingSchema);
    });
});
