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

type Order = {
    id: number;
    client_id: number;
    state_id: number;
    total_price: number;
    created_at: Date;
    updated_at: Date;
    estimated_for: Date;
    detail: string;
    state: string;
};

type ClientOrderAtLastState = {
    order_id: number;
    total_price: number;
    created_at: Date;
    updated_at: Date;
    estimated_for: Date;
    detail: string;
    last_state_change_at: Date;
    state: string;
    email: string;
    fullname: string;
    cellphone: string;
};

type OrderMenu = {
    id: number;
    order_id: number;
    price: number;
    detail: string;
    body: string;
};

// Transformations

type InternalMenuItemNode = Omit<MenuItem, 'parent_id' | 'group_id'> & {
    parent: InternalMenuItemNode | null;
};

type MenuItemNode = Omit<MenuItem, 'parent_id' | 'group_id'> & {
    children: MenuItemNode[];
};

type Menu = MenuItemNode[];
