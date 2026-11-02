import type { Booking, BookingFilters } from '../Models/booking';

interface FilterCase {
    name: string;
    filters: (booking: Booking) => BookingFilters;
    matches: boolean;
    knownDefect?: string;
}

export const filterCases: FilterCase[] = [
    { name: 'firstname', filters: (book) => ({ firstname: book.firstname }), matches: true },
    { name: 'lastname', filters: (book) => ({ lastname: book.lastname }), matches: true },
    {
        name: 'both names',
        filters: (book) => ({ firstname: book.firstname, lastname: book.lastname }),
        matches: true,
    },
    {
        name: 'unknown firstname',
        filters: (book) => ({ firstname: `${book.firstname}Absent` }),
        matches: false,
    },
    {
        name: 'matching firstname and wrong lastname',
        filters: (book) => ({ firstname: book.firstname, lastname: `${book.lastname}Absent` }),
        matches: false,
    },
    {
        name: 'checkin before arrival',
        filters: (book) => ({ firstname: book.firstname, checkin: '2030-06-09' }),
        matches: true,
    },
    {
        name: 'checkin equal to arrival',
        filters: (book) => ({ firstname: book.firstname, checkin: '2030-06-10' }),
        matches: true,
        knownDefect: 'RB-001: docs promise inclusive checkin; the live API excludes equality.',
    },
    {
        name: 'checkin after arrival',
        filters: (book) => ({ firstname: book.firstname, checkin: '2030-06-11' }),
        matches: false,
    },
    {
        name: 'checkout equal to departure',
        filters: (book) => ({ lastname: book.lastname, checkout: '2030-06-15' }),
        matches: true,
    },
    {
        name: 'checkout after departure',
        filters: (book) => ({ lastname: book.lastname, checkout: '2030-06-16' }),
        matches: false,
        knownDefect:
            'RB-002: docs promise checkout >= filter; the live API includes earlier checkout.',
    },
];
