import jwt from 'jsonwebtoken';
import environment from '../environment';

const expiresIn: string = '1d';

function generateAccessToken(user: ({ role: 'client' } & Pick<User, 'user_id' | 'client_id'>) | { role: 'admin' } & Pick<User, 'user_id' | 'admin_id'>): string {
    const payloadByRole = (user.role === 'client') ? { role: user.role, client_id: user.client_id } : { role: user.role, admin_id: user.admin_id };
    const payload: Session = {
        expiresIn,
        user_id: user.user_id,
        ...payloadByRole
    };

    return jwt.sign(payload, environment.SECRET_KEY, { expiresIn });
};

const generateRandomNumber = (max: number, min: number = 0): number => Math.floor(Math.random() * (max + 1) + min);

function generateSalt(length: number): string {
    const salt: string[] = [];

    if (length !== 0) {
        const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!?@#$%&^*()[]{}_-+<>";
        for (let index = 0; index < length; index++) {
            salt.push(CHARS[generateRandomNumber(CHARS.length - 1)]);
        }
    }
    return salt.join('');
};

const helpers = { generateAccessToken, generateSalt };

export default helpers;
