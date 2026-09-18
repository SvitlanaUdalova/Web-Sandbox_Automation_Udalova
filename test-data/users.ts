import { User, UserCredentials } from '../models/user-credentials';

const userCredentials = new UserCredentials('User', 'Zz7410741!@^');
export const user = new User(userCredentials, 'User', 'User');
