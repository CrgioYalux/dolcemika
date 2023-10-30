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
    role: string;
    email: string;
    fullname: string;
    created_at: Date;
    cellphone: string;
    birthdate: Date;
    password: string;
    hash: string;
    salt: string;
};

type MenuItem = {
    id: number;
    group_id: number;
    parent_id: number | null;
    title: string;
    detail: string;
    price: number;
};

type InternalMenuItemNode = Omit<MenuItem, 'parent_id' | 'group_id'> & {
    parent: InternalMenuItemNode | null;
};

type MenuItemNode = Omit<MenuItem, 'parent_id' | 'group_id'> & {
    children: MenuItemNode[];
};

type Menu = MenuItemNode[];
