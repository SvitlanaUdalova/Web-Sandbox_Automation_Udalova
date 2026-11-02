import { randomUUID } from 'node:crypto';
import type { Booking } from '../Models/booking';

export function buildBooking(overrides: Partial<Booking> = {}): Booking {
    const id = randomUUID().replaceAll('-', '');
    return {
        firstname: `Api${id}`,
        lastname: `Guest${id}`,
        totalprice: 150,
        depositpaid: true,
        bookingdates: { checkin: '2030-06-10', checkout: '2030-06-15' },
        additionalneeds: 'Breakfast',
        ...overrides,
    };
}
