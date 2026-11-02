import type { Booking } from '../Models/booking';

export const boundaryCases: { name: string; overrides: Partial<Booking> }[] = [
    { name: 'zero price', overrides: { totalprice: 0 } },
    { name: 'unit price', overrides: { totalprice: 1 } },
    { name: 'large integer price', overrides: { totalprice: 1_000_000 } },
    { name: 'empty additional needs', overrides: { additionalneeds: '' } },
    {
        name: 'encoded special characters',
        overrides: { additionalneeds: 'Tea & toast / 50% + milk?' },
    },
    {
        name: 'same-day booking',
        overrides: { bookingdates: { checkin: '2030-06-10', checkout: '2030-06-10' } },
    },
];
