import type { z } from 'zod';
import type {
    bookingDatesSchema,
    bookingReferenceSchema,
    bookingSchema,
    createdBookingSchema,
} from '../Schema/booking';

// Derived from the response schemas below, which are this project's single
// source of truth for these shapes.
export type BookingDates = z.infer<typeof bookingDatesSchema>;
export type Booking = z.infer<typeof bookingSchema>;
export type CreatedBooking = z.infer<typeof createdBookingSchema>;
export type BookingReference = z.infer<typeof bookingReferenceSchema>;

// Query parameters for GET /booking. This is a request shape, not a response
// body, so there is no schema to derive it from.
export interface BookingFilters {
    firstname?: string;
    lastname?: string;
    checkin?: string;
    checkout?: string;
}
