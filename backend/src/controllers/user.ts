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
    PublicFindById = `
        SELECT
            u.id, u.email, ud.fullname, ud.birthdate, ud.cellphone
        FROM 
            user AS u
        JOIN
            user_information AS ui
        ON
            u.id = ui.user_id
        WHERE
            u.id = ?
    `,
    InternalFindByEmail = `
        SELECT 
            u.id, u.email, u.created_at, u.role_id
        FROM
            user AS u
        WHERE 
            u.email = ?
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
    AddDescription = `
        INSERT INTO
            user_description (user_id, fullname, cellphone, birthdate)
        VALUES
            (?, ?, ?, ?)
    `,
};

interface UserOperation {
    CreateClient: {
        Action: (
            pool: PoolConnection,
            payload: Pick<User, 'email' | 'password'>
        ) => Promise<{ created: true, user: Pick<User, 'id'> } | { created: false, message: string }>;
        QueryReturnType: EffectfulQueryResult;
    };
    CreateAdmin: {
        Action: (
            pool: PoolConnection,
            payload: Pick<User, 'email' | 'password'>
        ) => Promise<{ created: true, user: Pick<User, 'id'> } | { created: false, message: string }>;
        QueryReturnType: EffectfulQueryResult;
    };
    AddDescription: {
        Action: (
            pool: PoolConnection,
            payload: Pick<User, 'id' | 'fullname' | 'cellphone' | 'birthdate'>
        ) => Promise<{ done: true } | { done: false, message: string }>;
        QueryReturnType: EffectfulQueryResult;
    };
    AddAuth: {
        Action: (
            pool: PoolConnection,
            payload: Pick<User, 'id' | 'password'>
        ) => Promise<{ done: true } | { done: false, message: string }>;
        QueryReturnType: EffectfulQueryResult;
    };
    PublicFindById: {
        Action: (
            pool: PoolConnection,
            payload: Pick<User, 'id'>
        ) => Promise<{ found: true, user: Pick<User,'id' | 'email' | 'fullname' | 'birthdate' | 'cellphone'> } | { found: false, message: string }>;
        QueryReturnType: EffectlessQueryResult<Pick<User,'id' | 'email' | 'fullname' | 'birthdate' | 'cellphone'>>;
    };
    InternalFindByEmail: {
        Action: (
            pool: PoolConnection,
            payload: Pick<User, 'email'>
        ) => Promise<{ found: true, user: Pick<User, 'id' | 'created_at' | 'role_id' | 'email'> } | { found: false }>;
        QueryReturnType: EffectlessQueryResult<Pick<User, 'id' | 'created_at' | 'role_id' | 'email'>>;
    };
    CheckIfCredentialsMatch: {
        Action: (
            payload: Pick<User, 'password' | 'hash' | 'salt'>
        ) => Promise<{ match: boolean }>;
        QueryReturnType: EffectfulQueryResult;
    };
    Auth: {
        Action: (
            pool: PoolConnection,
            payload: Pick<User, 'email' | 'password'>
        ) => Promise<{ authenticated: true, user: Pick<User, 'id'> } | { authenticated: false, message: string }>;
        QueryReturnType: EffectlessQueryResult<Pick<User, 'id' | 'hash' | 'salt'>>;
    };
};

const CreateClient: UserOperation['CreateClient']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        return pool.beginTransaction((err0) => {
            if (err0) {
                reject({ beginCreateClientTransactionError: err0 });
                return;
            }

            pool.query(UserOperationQuery.CreateClient, [payload.email], async (err1, results) => {
                if (err1) {
                    pool.rollback(() => {
                        reject({ clientCreationError: err1 });
                    });
                    return;
                }

                const parsed = results as UserOperation['CreateClient']['QueryReturnType'];

                if (!parsed.affectedRows) {
                    resolve({ created: false, message: 'Could not create client' });
                    return;
                }

                AddAuth(pool, { id: parsed.insertId, password: payload.password })
                .then((res) => {
                    if (!res.done) {
                        pool.rollback(() => {
                            resolve({ created: false, message: 'Could not add authentication to client' });
                        });
                        return;
                    }
                    
                    pool.commit((err2) => {
                        if (err2) {
                            reject({ commitCreateClientTransactionError: err2 });
                            return;
                        }

                        resolve({ created: true, user: { id: parsed.insertId }});
                    });
                })
                .catch((err3) => {
                    reject({ clientAuthCreationError: err3 });
                });
            });
        });
    });
};

const CreateAdmin: UserOperation['CreateAdmin']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        return pool.beginTransaction((err0) => {
            if (err0) {
                reject({ beginCreateAdminTransactionError: err0 });
                return;
            }

            pool.query(UserOperationQuery.CreateAdmin, [payload.email], async (err1, results) => {
                if (err1) {
                    pool.rollback(() => {
                        reject({ adminCreationError: err1 });
                    });
                    return;
                }

                const parsed = results as UserOperation['CreateAdmin']['QueryReturnType'];

                if (!parsed.affectedRows) {
                    resolve({ created: false, message: 'Could not create admin' });
                    return;
                }

                AddAuth(pool, { id: parsed.insertId, password: payload.password })
                .then((res) => {
                    if (!res.done) {
                        pool.rollback(() => {
                            resolve({ created: false, message: 'Could not add authentication to admin' });
                        });
                        return;
                    }
                    
                    pool.commit((err2) => {
                        if (err2) {
                            reject({ commitCreateAdminTransactionError: err2 });
                            return;
                        }

                        resolve({ created: true, user: { id: parsed.insertId }});
                    });
                })
                .catch((err3) => {
                    reject({ adminAuthCreationError: err3 });
                });
            });
        });
    });
};

const AddDescription: UserOperation['AddDescription']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(UserOperationQuery.AddDescription, [payload.id, payload.fullname, payload.cellphone, payload.birthdate], (err, results) => {
            if (err) {
                reject({ addDescriptionError: err });
                return;
            }

            const parsed = results as UserOperation['AddDescription']['QueryReturnType'];

            if (!parsed.affectedRows) {
                resolve({ done: false, message: 'Could not add user description' });
                return;
            }

            resolve({ done: true });
        });
    });
};

const AddAuth: UserOperation['AddAuth']['Action'] = (pool, payload) => {
    return new Promise(async (resolve, reject) => {
        const salt = helpers.generateSalt(100);

        bcrypt.hash(payload.password.concat(salt), 10, (err0, hash) => {
            if (err0) {
                reject({ hashingError: err0 });
                return;
            }

            pool.query(UserOperationQuery.AddAuth, [payload.id, hash, salt], (err1, results) => {
                if (err1) {
                    reject({ addAuthError: err1 });
                    return;
                }

                const parsed = results as UserOperation['AddAuth']['QueryReturnType'];

                if (!parsed.affectedRows) {
                    resolve({ done: false, message: 'Could not add the authentication' });
                    return;
                }

                resolve({ done: true });
            });
        });
    });
};

const InternalFindByEmail: UserOperation['InternalFindByEmail']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(UserOperationQuery.InternalFindByEmail, [payload.email], (err, results) => {
            if (err) {
                reject(err);
                return;
            }

            const parsed = results as UserOperation['InternalFindByEmail']['QueryReturnType'];

            if (!parsed.length) {
                resolve({ found: false });
                return;
            }
            
            resolve({ found: true, user: parsed[0] });
        });
    });
};

const PublicFindById: UserOperation['PublicFindById']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(UserOperationQuery.PublicFindById, [payload.id], (err, results) => {
            if (err) {
                reject({ publicFindByIdError: err });
                return;
            }

            const parsed = results as UserOperation['PublicFindById']['QueryReturnType'];

            if (!parsed.length) {
                resolve({ found: false, message: 'Could not find an user with that id' });
                return;
            }

            resolve({ found: true, user: parsed[0] });
        });
    });
};

const CheckIfCredentialsMatch: UserOperation['CheckIfCredentialsMatch']['Action'] = (payload) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(payload.password.concat(payload.salt), payload.hash, (err, match) => {
            if (err) {
                reject(err);
                return;
            }
            
            resolve({ match });
        });
    });
};

const Auth: UserOperation['Auth']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        InternalFindByEmail(pool, { email: payload.email })
        .then((res) => {
            if (!res.found) {
                resolve({ authenticated: false, message: 'Could not find an user with that email' });
                return;
            }

            pool.query(UserOperationQuery.Auth, [res.user.id], (err, results) => {
                if (err) {
                    reject({ findAuthenticationError: err });
                    return;
                }
                
                const parsed = results as UserOperation['Auth']['QueryReturnType'];

                if (!parsed.length) {
                    resolve({ authenticated: false, message: 'Could not find authentication for the user' });
                    return;
                }

                CheckIfCredentialsMatch({ password: payload.password, hash: parsed[0].hash, salt: parsed[0].salt })
                .then((res) => {
                    if (!res.match) {
                        resolve({ authenticated: false, message: 'Could not authenticate because the credentials are wrong' });
                        return;
                    }

                    resolve({ authenticated: true, user: { id: parsed[0].id } });
                })
                .catch((err) => {
                    reject({ authenticationError: err });
                });
            });
        })
        .catch((err) => {
            reject({ findUserByEmailError: err });
        });
    });
};

const User = {
    CreateClient,
    CreateAdmin,
    AddAuth,
    AddDescription,
    Auth,
    PublicFindById
};

export default User;
