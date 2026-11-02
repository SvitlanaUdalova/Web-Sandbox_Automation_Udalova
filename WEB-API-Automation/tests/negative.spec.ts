import { bookingReferencesSchema, bookingSchema, createdBookingSchema } from '../Schema/booking';
import { buildBooking } from '../test data/booking-factory';
import { expectJson, expectText } from '../utils/assertions';
import { test, expect } from '../fixtures/fixtures';

test.describe('Booking access and representation errors', { tag: '@regression' }, () => {
    test('unknown booking returns a plain-text 404', async ({ bookings }) => {
        expectText(await bookings.get(0), 404, 'Not Found');
    });

    for (const method of ['PUT', 'PATCH', 'DELETE'] as const) {
        test(`${method} without authentication is forbidden and leaves data unchanged`, async ({
            bookings,
        }) => {
            const original = buildBooking();
            const created = expectJson(await bookings.create(original), createdBookingSchema);
            const response =
                method === 'PUT'
                    ? await bookings.replace(created.bookingid, buildBooking())
                    : method === 'PATCH'
                      ? await bookings.update(created.bookingid, { totalprice: 999 })
                      : await bookings.delete(created.bookingid);
            expectText(response, 403, 'Forbidden');
            expect(expectJson(await bookings.get(created.bookingid), bookingSchema)).toEqual(
                original,
            );
        });
    }

    test('an invalid token cannot update a booking', async ({ bookings, invalidTokenBookings }) => {
        const original = buildBooking();
        const created = expectJson(await bookings.create(original), createdBookingSchema);
        expectText(
            await invalidTokenBookings.update(created.bookingid, { totalprice: 999 }),
            403,
            'Forbidden',
        );
        expect(expectJson(await bookings.get(created.bookingid), bookingSchema)).toEqual(original);
    });

    test('API-NEG-007: an invalid token cannot replace a booking', async ({
        bookings,
        invalidTokenBookings,
    }) => {
        const original = buildBooking();
        const created = expectJson(await bookings.create(original), createdBookingSchema);

        expectText(
            await invalidTokenBookings.replace(created.bookingid, buildBooking()),
            403,
            'Forbidden',
        );

        expect(expectJson(await bookings.get(created.bookingid), bookingSchema)).toEqual(original);
    });

    test('API-NEG-008: an invalid token cannot delete a booking', async ({
        bookings,
        invalidTokenBookings,
    }) => {
        const original = buildBooking();
        const created = expectJson(await bookings.create(original), createdBookingSchema);

        expectText(await invalidTokenBookings.delete(created.bookingid), 403, 'Forbidden');

        expect(expectJson(await bookings.get(created.bookingid), bookingSchema)).toEqual(original);
    });

    test('API-NEG-009: a deleted booking is no longer readable or searchable', async ({
        bookings,
        authenticatedBookings,
    }) => {
        const original = buildBooking();
        const created = expectJson(await bookings.create(original), createdBookingSchema);

        expectText(await authenticatedBookings.delete(created.bookingid), 201, 'Created');

        expectText(await bookings.get(created.bookingid), 404, 'Not Found');
        const matches = expectJson(
            await bookings.list({ firstname: original.firstname, lastname: original.lastname }),
            bookingReferencesSchema,
        );
        expect(matches).toEqual([]);
    });

    test('an unsupported Accept representation is rejected', async ({ bookings }) => {
        const created = expectJson(await bookings.create(buildBooking()), createdBookingSchema);
        const response = await bookings.get(created.bookingid, 'text/plain');
        expectText(response, 418, "I'm a Teapot");
        expect(expectJson(await bookings.get(created.bookingid), bookingSchema)).toEqual(
            created.booking,
        );
    });
});
