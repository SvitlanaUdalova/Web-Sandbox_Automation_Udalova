import { z } from 'zod';
import type { Booking, BookingReference, CreatedBooking } from '../Models/booking';

export const bookingSchema = z.strictObject({
    firstname: z.string(),
    lastname: z.string(),
    totalprice: z.number().int(),
    depositpaid: z.boolean(),
    bookingdates: z.strictObject({
        checkin: z.iso.date(),
        checkout: z.iso.date(),
    }),
    additionalneeds: z.string().optional(),
}) satisfies z.ZodType<Booking>;

export const createdBookingSchema = z.strictObject({
    bookingid: z.number().int().positive(),
    booking: bookingSchema,
}) satisfies z.ZodType<CreatedBooking>;

export const bookingIdSchema = z.object({ bookingid: z.number().int().positive() });

export const bookingReferencesSchema = z.array(
    z.strictObject({ bookingid: z.number().int().positive() }),
) satisfies z.ZodType<BookingReference[]>;
