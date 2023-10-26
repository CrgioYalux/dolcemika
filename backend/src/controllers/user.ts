import bcrypt from 'bcrypt'

import type { PoolConnection } from "mysql";

import helpers from '../helpers';

enum UserOperationQuery {
    CreateClient = `
        CALL CreateUserClient(?)
    `,
    CreateAdmin = `
        CALL CreateUserAdmin(?)
    `,
    AddAuth = `
        INSERT INTO 
            user_auth (user_id, hash, salt)
        VALUES
            (?, ?, ?)
    `,
    Auth = `
        SELECT 
            u.id, ua.hash, ua.salt
        FROM 
            user AS u
        JOIN
            user_auth AS ua 
        ON
            u.id = ua.user_id 
        WHERE
            u.id = ?
    `,
    FindByEmail = `
        SELECT 
            u.id, u.email, u.created_at, u.role_id
        FROM
            user AS u
        WHERE 
            u.email = ?
    `,
    FindById = `
        SELECT 
            u.id, u.email, ui.fullname, ui.cellphone, ui.birthdate
        FROM
            user AS u
        JOIN
            user_information AS ui
        ON 
            u.id = ui.user_id
        WHERE 
            u.id = ?
    `,
    Delete = `
        CALL DeleteUser(?)
    `,
    
};

interface UserOperation {
    CreateClient: {
        Action: (
            pool: PoolConnection,
            payload: Pick<User, 'email' | 'password'>
        ) => Promise<{ created: true, user: Pick<User, 'id'> } | { created: false, message: string }>;
        ResolvedReturnType: Pick<User, 'id'>;
    };
    CreateAdmin: {
        Action: (
            pool: PoolConnection,
            payload: Pick<User, 'email' | 'password'>
        ) => Promise<{ created: true, user: Pick<User, 'id'> } | { created: false, message: string }>;
        ResolvedReturnType: Pick<User, 'id'>;
    };
    AddAuth: {
        Action: (
            pool: PoolConnection,
            payload: Pick<User, 'id' | 'password'>
        ) => Promise<{ done: true } | { done: false, message: string }>;
    };
    FindByEmail: {
        Action: (
            pool: PoolConnection,
            payload: Pick<User, 'email'>
        ) => Promise<{ found: true, user: Pick<User, 'id' | 'created_at' | 'role_id' | 'email'> }>;
        ResolvedReturnType: Pick<User, 'id' | 'created_at' | 'role_id' | 'email'>;
    };
    Auth: {
        Action: (
            pool: PoolConnection,
            payload: Pick<User, 'id' | 'password'>
        ) => Promise<{ authenticated: false, message: string } | { authenticated: true }>;
        ResolvedReturnType: Pick<User, 'id' | 'hash' | 'salt'>;
    };
    CheckIfCredentialsMatch: {
        Action: (
            payload: Pick<User, 'password' | 'hash' | 'salt'>
        ) => Promise<{ match: boolean }>;
    };
    Delete: {
    };
};
