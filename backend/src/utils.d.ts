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
    user_id: number;
    admin_id: number | null;
    client_id: number | null;
    role_id: number;
    role: 'admin' | 'client';
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
    menu_item_id: number;
    parent_id: number | null;
    is_available: boolean;
    title: string;
    detail: string | null;
    price: number | null;
    image: Buffer | null;
};

type OrderPossibleState = 'just arrived' | 'accepted' | 'started' | 'paused' | 'revising' | 'canceled' | 'to be delivered' | 'finished';

type Order = {
    id: number;
    order_id: number;
    client_id: number;
    state_id: number;
    is_finished: boolean;
    total_price: number;
    created_at: Date;
    updated_at: Date;
    last_state_at: date;
    estimated_for: Date;
    detail: string;
    state: OrderPossibleState;
};

type ClientOrderAtLastState = {
    order_id: number;
    total_price: number;
    created_at: Date;
    updated_at: Date;
    estimated_for: Date;
    detail: string;
    last_state_change_at: Date;
    state: OrderPossibleState;
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

type Ingredient = {
    ingredient_id: number;
    title: string;
    detail: string | null;
    stock: number;
};

type Inventory = Ingredient[];

// Transformations

type MenuItemNode = Omit<MenuItem, 'parent_id'> & {
    children: MenuItemNode[];
};

type Menu = MenuItemNode[];
