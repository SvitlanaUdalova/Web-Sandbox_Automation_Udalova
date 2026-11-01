export interface Credentials {
    username: string;
    password: string;
}

export interface AuthToken {
    token: string;
}

export interface AuthFailure {
    reason: string;
}
