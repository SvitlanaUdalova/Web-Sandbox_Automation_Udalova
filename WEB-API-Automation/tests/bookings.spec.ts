import { test, expect } from '../fixtures/fixtures';
import { expectJson, expectText } from '../utils/assertions';
import { bookingReferencesSchema, bookingSchema, createdBookingSchema } from '../Schema/booking';
import { buildBooking } from '../test data/booking-factory';

test.describe('Booking workflows', { tag: '@regression' }, () => {
    test('create and retrieve preserve all fields', { tag: '@smoke' }, async ({ bookings }) => {
        const payload = buildBooking();
        const created = expectJson(await bookings.create(payload), createdBookingSchema);
        expect(created.booking).toEqual(payload);
        expect(expectJson(await bookings.get(created.bookingid), bookingSchema)).toEqual(payload);
    });

    test('list contains the new booking and valid identifiers', async ({ bookings }) => {
        const created = expectJson(await bookings.create(buildBooking()), createdBookingSchema);
        const entries = expectJson(await bookings.list(), bookingReferencesSchema);
        expect(
            entries.every((entry) => Number.isInteger(entry.bookingid) && entry.bookingid > 0),
        ).toBe(true);
        expect(entries.some((entry) => entry.bookingid === created.bookingid)).toBe(true);
    });

    test('PUT replaces the entire booking and persists', async ({
        bookings,
        authenticatedBookings,
    }) => {
        const created = expectJson(await bookings.create(buildBooking()), createdBookingSchema);
        const replacement = buildBooking({ totalprice: 325, depositpaid: false });
        expect(
            expectJson(
                await authenticatedBookings.replace(created.bookingid, replacement),
                bookingSchema,
            ),
        ).toEqual(replacement);
        expect(expectJson(await bookings.get(created.bookingid), bookingSchema)).toEqual(
            replacement,
        );
    });

    test('PATCH changes a name while preserving unrelated fields', async ({
        bookings,
        authenticatedBookings,
    }) => {
        const original = buildBooking();
        const created = expectJson(await bookings.create(original), createdBookingSchema);
        const changes = { firstname: `${original.firstname}Updated` };
        expect(
            expectJson(
                await authenticatedBookings.update(created.bookingid, changes),
                bookingSchema,
            ),
        ).toEqual({ ...original, ...changes });
        expect(expectJson(await bookings.get(created.bookingid), bookingSchema)).toEqual({
            ...original,
            ...changes,
        });
    });

    test('DELETE removes only the owned booking', async ({ bookings, authenticatedBookings }) => {
        const deleted = expectJson(await bookings.create(buildBooking()), createdBookingSchema);
        const retained = expectJson(await bookings.create(buildBooking()), createdBookingSchema);
        expectText(await authenticatedBookings.delete(deleted.bookingid), 201, 'Created');
        expectText(await bookings.get(deleted.bookingid), 404, 'Not Found');
        expect(expectJson(await bookings.get(retained.bookingid), bookingSchema)).toEqual(
            retained.booking,
        );
    });

    test('optional additionalneeds may be omitted', async ({ bookings }) => {
        const { additionalneeds, ...payload } = buildBooking();
        const created = expectJson(await bookings.create(payload), createdBookingSchema);
        const persisted = expectJson(await bookings.get(created.bookingid), bookingSchema);
        expect(persisted).toEqual(payload);
        expect(persisted.additionalneeds).toBeUndefined();
    });

    test('PATCH persists a false deposit flag', async ({ bookings, authenticatedBookings }) => {
        const original = buildBooking({ depositpaid: true });
        const created = expectJson(await bookings.create(original), createdBookingSchema);
        expect(
            expectJson(
                await authenticatedBookings.update(created.bookingid, { depositpaid: false }),
                bookingSchema,
            ),
        ).toEqual({ ...original, depositpaid: false });
        expect(expectJson(await bookings.get(created.bookingid), bookingSchema).depositpaid).toBe(
            false,
        );
    });

    test('create update filter and delete form an isolated end-to-end flow', async ({
        bookings,
        authenticatedBookings,
    }) => {
        const original = buildBooking();
        const created = expectJson(await bookings.create(original), createdBookingSchema);
        const changedName = `${original.firstname}Changed`;
        expectJson(
            await authenticatedBookings.update(created.bookingid, { firstname: changedName }),
            bookingSchema,
        );
        const matches = expectJson(
            await bookings.list({ firstname: changedName, lastname: original.lastname }),
            bookingReferencesSchema,
        );
        expect(matches).toEqual([{ bookingid: created.bookingid }]);
        expect(expectJson(await bookings.get(created.bookingid), bookingSchema)).toEqual({
            ...original,
            firstname: changedName,
        });
        expectText(await authenticatedBookings.delete(created.bookingid), 201, 'Created');
        await expect
            .poll(async () => (await bookings.get(created.bookingid)).status, {
                message: 'Deleted booking must become unavailable',
                timeout: 5000,
            })
            .toBe(404);
    });
});
