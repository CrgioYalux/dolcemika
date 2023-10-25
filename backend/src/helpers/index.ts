import jwt from 'jsonwebtoken';
import environment from '../environment';

type JWTCommunityMemberPayload = Pick<CommunityMember, 'id' | 'username'>;

const expiresIn: string = '7d';

function generateAccessToken(member: JWTCommunityMemberPayload): string {
    return jwt.sign({ ...member, expiresIn }, environment.SECRET_KEY, { expiresIn });
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
