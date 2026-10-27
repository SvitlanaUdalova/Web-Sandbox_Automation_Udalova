export class Book {
    constructor(public title: string, public isbn: string) {
    }
}

export interface BookDetails extends Book {
    author: string;
    publisher: string;
}