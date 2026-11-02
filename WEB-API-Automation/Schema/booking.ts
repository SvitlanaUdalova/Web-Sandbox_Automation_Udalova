import { z } from 'zod';

export const bookingDatesSchema = z.strictObject({
    checkin: z.iso.date(),
    checkout: z.iso.date(),
});

export const bookingSchema = z.strictObject({
    firstname: z.string(),
    lastname: z.string(),
    totalprice: z.number().int(),
    depositpaid: z.boolean(),
    bookingdates: bookingDatesSchema,
    additionalneeds: z.string().optional(),
});

export const createdBookingSchema = z.strictObject({
    bookingid: z.number().int().positive(),
    booking: bookingSchema,
});

// Deliberately lenient (not strict): used only to pull a bookingid out of a
// full CreatedBooking response for cleanup tracking, so extra sibling fields
// such as `booking` must not cause a parse failure.
export const bookingIdSchema = z.object({ bookingid: z.number().int().positive() });

export const bookingReferenceSchema = z.strictObject({
    bookingid: z.number().int().positive(),
});

export const bookingReferencesSchema = z.array(bookingReferenceSchema);
