import { test, expect } from '../fixtures/fixtures';
import { expectJson } from '../utils/assertions';
import { bookingReferencesSchema, createdBookingSchema } from '../Schema/booking';
import { buildBooking } from '../test data/booking-factory';
import { filterCases } from '../test data/filter-cases';

test.describe('Booking filters', { tag: '@regression' }, () => {
    for (const scenario of filterCases) {
        test(scenario.name, async ({ bookings }) => {
            const booking = buildBooking();
            const created = expectJson(await bookings.create(booking), createdBookingSchema);
            const entries = expectJson(
                await bookings.list(scenario.filters(booking)),
                bookingReferencesSchema,
            );
            if (scenario.knownDefect) {
                test.fail(true, scenario.knownDefect);
            }
            expect(entries).toEqual(scenario.matches ? [{ bookingid: created.bookingid }] : []);
        });
    }
});
