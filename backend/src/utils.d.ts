/// <reference path="../../utils.d.ts" />

// SQL types

type EffectfulQueryResult = {
    fieldCount: number;
    affectedRows: number;
    insertId: number;
    serverStatus: number;
    warningCount: number;
    message: string;
    protocol41: boolean;
    changedRows: number;
};

type EffectlessQueryResult<T> = T[];

// Database Tables : Development Types

type User = {
	id: number;
	role_id: number;
	email: string;
	fullname: string;
    created_at: Date;
	cellphone: string;
	birthdate: Date;
    password: string;
    hash: string;
    salt: string;
};
