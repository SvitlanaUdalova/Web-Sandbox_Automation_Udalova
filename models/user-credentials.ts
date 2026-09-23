export class UserCredentials {
    constructor(public username: string,
        public password: string) {
    }
}

export class User {
    constructor(public credentials: UserCredentials,
        public firstName: string,
        public lastName: string) {
    }
}