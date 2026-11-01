import { test, expect } from '@playwright/test';
import { bookingSchema } from '../Schema/booking';
import { buildBooking } from '../test data/booking-factory';

test.describe('Local consumer contract guards', { tag: '@regression' }, () => {
    test('removing a required field is detected', () => {
        const { firstname, ...withoutName } = buildBooking();
        expect(bookingSchema.safeParse(withoutName).success).toBe(false);
    });

    test('changing a numeric field type is detected', () => {
        expect(bookingSchema.safeParse({ ...buildBooking(), totalprice: '150' }).success).toBe(
            false,
        );
    });

    test('unexpected fields require explicit contract review', () => {
        expect(bookingSchema.safeParse({ ...buildBooking(), unreviewedField: true }).success).toBe(
            false,
        );
    });

    test('null nested dates fail safely rather than being dereferenced', () => {
        expect(bookingSchema.safeParse({ ...buildBooking(), bookingdates: null }).success).toBe(
            false,
        );
    });
});
