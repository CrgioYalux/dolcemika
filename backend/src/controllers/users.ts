import bcrypt from 'bcrypt'

import helpers from '../helpers';

import type { PoolConnection } from 'mysql';

enum UserOperationQuery {
    InternalFindClientRoleId = `
        SELECT
            ur.id as role_id
        FROM
            user_roles AS ur
        WHERE
            ur.role = 'client'
        LIMIT 1
    `,
    CreateUser = `
        INSERT INTO 
            user (role_id, email)
        VALUES 
            (?, ?)
    `,
    AddDescription = `
        INSERT INTO
            user_description (user_id, fullname, cellphone, birthdate)
        VALUES
            (?, ?, ?, ?)
    `,
    AddAuth = `
        INSERT INTO 
            user_auth (user_id, hash, salt)
        VALUES
            (?, ?, ?)
    `,
    PublicFindById = `
        SELECT
            u.id AS user_id,
            uc.id AS client_id,
            ua.id AS admin_id,
            ur.role,
            u.email,
            ud.fullname,
            ud.birthdate,
            ud.cellphone
        FROM 
            user AS u
        JOIN
            user_description AS ud
        ON
            u.id = ud.user_id
        JOIN
            user_roles AS ur
        ON 
            ur.id = u.role_id
        LEFT JOIN
            user_client AS uc
        ON
            u.id = uc.user_id
        LEFT JOIN
            user_admin AS ua
        ON
            u.id = ua.user_id
        WHERE
                u.id = ?
        LIMIT 1
    `,
    InternalFindByEmail = `
        SELECT 
            u.id, u.email, u.created_at, u.role_id
        FROM
            user AS u
        WHERE 
            u.email = ?
        LIMIT 1
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
        LIMIT 1
    `,
};

interface UserOperation {
    InternalFindClientRoleId: {
        Action: (
            pool: PoolConnection
        ) => Promise<{ found: true } & Pick<User, 'role_id'> | { found: false, message: string }>;
        QueryReturnType: EffectlessQueryResult<Pick<User, 'role_id'>>;
    };
    CreateUser: {
        Action: (
            pool: PoolConnection,
            payload: Pick<User, 'email' | 'role_id' >
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
    CreateClient: {
        Action: (
            pool: PoolConnection,
            payload: Pick<User, 'email' | 'password' | 'fullname' | 'cellphone' | 'birthdate'>
        ) => Promise<{ created: true, user: Pick<User, 'id'> } | { created: false, message: string }>;
        QueryReturnType: EffectfulQueryResult;
    };
    PublicFindById: {
        Action: (
            pool: PoolConnection,
            payload: Pick<User, 'id'>
        ) => Promise<{ found: true, user: Pick<User,'user_id' | 'client_id' | 'admin_id' | 'role' | 'email' | 'fullname' | 'birthdate' | 'cellphone'> } | { found: false, message: string }>;
        QueryReturnType: EffectlessQueryResult<Pick<User,'user_id' | 'client_id' | 'admin_id' | 'role' | 'email' | 'fullname' | 'birthdate' | 'cellphone'>>;
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

const InternalFindClientRoleId: UserOperation['InternalFindClientRoleId']['Action'] = (pool) => {
    return new Promise((resolve, reject) => {
        pool.query(UserOperationQuery.InternalFindClientRoleId, (err, results) => {
            if (err) {
                reject(err);
                return;
            }

            const parsed = results as UserOperation['InternalFindClientRoleId']['QueryReturnType'];

            if (!parsed.length) {
                resolve({ found: false, message: 'Could not find client role id' });
                return;
            }

            const role_id = parsed[0].role_id;

            resolve({ found: true, role_id });
        });
    });
};

const CreateUser: UserOperation['CreateUser']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(UserOperationQuery.CreateUser, [payload.role_id, payload.email], (err, results) => {
            if (err) {
                reject(err);
                return;
            }

            const parsed = results as UserOperation['CreateUser']['QueryReturnType'];

            if (!parsed.affectedRows) {
                resolve({ created: false, message: 'Could not create the user' });
                return;
            }

            resolve({ created: true, user: { id: parsed.insertId }});
        });
    });
};

const AddDescription: UserOperation['AddDescription']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(UserOperationQuery.AddDescription, [payload.id, payload.fullname, payload.cellphone, payload.birthdate], (err, results) => {
            if (err) {
                reject(err);
                return;
            };

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

const CreateClient: UserOperation['CreateClient']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.beginTransaction((errBegin) => {
            if (errBegin) {
                reject({ createClientBeginTransactionError: errBegin });
                return;
            }

            InternalFindByEmail(pool, { email: payload.email })
            .then((res0) => {
                if (res0.found) {
                    pool.rollback(() => {
                        resolve({ created: false, message: 'There\'s already an account with that email' });
                    });
                    return;
                }

                InternalFindClientRoleId(pool)
                .then((res1) => {
                    if (!res1.found) {
                        pool.rollback(() => {
                            resolve({ created: false, message: res1.message });
                        });
                        return;
                    }

                    CreateUser(pool, { role_id: res1.role_id, email: payload.email })
                    .then((res2) => {
                        if (!res2.created) {
                            pool.rollback(() => {
                                resolve({ created: false, message: res2.message });
                            });
                            return;
                        }

                        AddDescription(pool, { id: res2.user.id, fullname: payload.fullname, cellphone: payload.cellphone, birthdate: payload.birthdate })
                        .then((res3) => {
                            if (!res3.done) {
                                pool.rollback(() => {
                                    resolve({ created: false, message: res3.message });
                                });
                                return;
                            }

                            AddAuth(pool, { id: res2.user.id, password: payload.password })
                            .then((res4) => {
                                if (!res4.done) {
                                    pool.rollback(() => {
                                        resolve({ created: false, message: res4.message });
                                    });
                                    return;
                                }
                                
                                pool.commit((errCommit) => {
                                    if (errCommit) {
                                        pool.rollback(() => {
                                            reject({ createClientCommitTransactionError: errCommit });
                                        });
                                    }

                                    resolve({ created: true, user: { id: res2.user.id} });
                                });
                            })
                            .catch((err) => {
                                pool.rollback(() => {
                                    reject({ addAuthError: err });
                                });
                            });
                        })
                        .catch((err) => {
                            pool.rollback(() => {
                                reject({ addDescriptionError: err });
                            });
                        });
                    })
                    .catch((err) => {
                        pool.rollback(() => {
                            reject({ createUserError: err });
                        });
                    });
                })
                .catch((err) => {
                    pool.rollback(() => {
                        reject({ findClientRoleIdError: err });
                    });
                });
            })
            .catch((err) => {
                pool.rollback(() => {
                    reject({ findByEmailError: err });
                });
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

const Users = {
    CreateClient,
    Auth,
    PublicFindById,
};

export default Users;
