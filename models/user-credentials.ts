class UserCredentials {
    readonly username: string;
    readonly password: string;

    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
    }
}

class User {
    credentials: UserCredentials;
    firstName: string;
    lastName: string;

    constructor(credentials: UserCredentials, firstName: string, lastName: string) {
        this.credentials = credentials;
        this.firstName = firstName;
        this.lastName = lastName;
    }
}

export { UserCredentials, User };
export default UserCredentials;