import { test, expect } from '../fixtures/fixtures';
import { expectJson } from '../utils/assertions';
import { bookingSchema, createdBookingSchema } from '../Schema/booking';
import { buildBooking } from '../test data/booking-factory';
import { boundaryCases } from '../test data/boundary-cases';

test.describe('Booking value preservation', { tag: '@regression' }, () => {
    for (const scenario of boundaryCases) {
        test(scenario.name, async ({ bookings }) => {
            const payload = buildBooking(scenario.overrides);
            const created = expectJson(await bookings.create(payload), createdBookingSchema);
            expect(created.booking).toEqual(payload);
            expect(expectJson(await bookings.get(created.bookingid), bookingSchema)).toEqual(
                payload,
            );
        });
    }
});
