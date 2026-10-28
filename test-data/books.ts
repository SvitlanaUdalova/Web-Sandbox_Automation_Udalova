import { Book, BookDetails } from '../models/book';

export const books: Book[] = [
    new Book('Git Pocket Guide', '9781449325862'), 
    new Book('Programming JavaScript Applications', '9781491950296')
];

export const selectiveDeletionBooks: [Book, Book, Book] = [
    books[0],
    books[1],
    new Book('Learning JavaScript Design Patterns', '9781449331818'),
];

export const gitPocketGuideDetails: BookDetails = {
    ...books[0],
    author: 'Richard E. Silverman',
    publisher: "O'Reilly Media",
};
