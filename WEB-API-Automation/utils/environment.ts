import dotenv from 'dotenv';
import path from 'node:path';
import type { Credentials } from '../Models/auth';

dotenv.config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });

export function getEnvironment() {
    const name = process.env.API_ENV || 'public';
    if (name !== 'public' && name !== 'custom') {
        throw new Error('API_ENV must be public or custom.');
    }

    const baseURL =
        process.env.API_BASE_URL ||
        (name === 'public' ? 'https://restful-booker.herokuapp.com' : undefined);
    if (!baseURL) {
        throw new Error('API_BASE_URL is required for API_ENV=custom.');
    }
    const url = new URL(baseURL);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
        throw new Error('API_BASE_URL must be an HTTP(S) URL without embedded credentials.');
    }

    return { name, baseURL: url.href };
}

export function getCredentials(): Credentials {
    const username = process.env.API_USERNAME;
    const password = process.env.API_PASSWORD;
    if (!username || !password) {
        throw new Error('Set API_USERNAME and API_PASSWORD in the local .env or CI secrets.');
    }
    return { username, password };
}
