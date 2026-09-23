import { User, UserCredentials } from '../models/user-credentials';

function requiredEnvironmentVariable(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Required environment variable "${name}" is not set.`);
    }

    return value;
}

const userCredentials = new UserCredentials(
    requiredEnvironmentVariable('DEMOQA_USERNAME'),
    requiredEnvironmentVariable('DEMOQA_PASSWORD'),
);
export const user = new User(userCredentials, 'User', 'User');
