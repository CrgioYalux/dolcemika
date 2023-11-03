import { fromMenuItemListToMenuTree } from "./helpers";

import type { PoolConnection } from 'mysql';

enum MenuOperationQuery {
    Get = `
        SELECT * FROM MenuItemsDescribed
    `,
    AddItemDescription = `
        INSERT INTO
            menu_item_description (menu_item_id, title, detail, price, image)
        VALUES
            (?, ?, ?, ?, NULL)
    `,
    AddItem = `
        INSERT INTO 
            menu_item (parent_id, is_available)
        VALUES
            (?, ?)
    `,
    ChangeItemDescription = `
        UPDATE menu_item_description mid
        SET 
            mid.title = IF(? IS NULL, mid.title, ?),
            mid.detail = ?,
            mid.price = ?,
            mid.image = ?
        WHERE
            mid.menu_item_id = ?
    `,
    ChangeItemAvailability = `
        UPDATE menu_item mi
        SET
            mi.is_available = ?
        WHERE
            mi.id = ?
    `,
    DeleteItem = `
        DELETE FROM 
            menu_item mi
        WHERE
            mi.id = ?
    `,
};

interface MenuOperation {
    Get: {
        Action: (
            pool: PoolConnection
        ) => Promise<{ found: true, menu: Menu } | { found: false, message: string }>;
        QueryReturnType: EffectlessQueryResult<MenuItem>;
    };
    AddItemDescription: {
        Action: (
            pool: PoolConnection,
            payload: Pick<MenuItem, 'menu_item_id' | 'title'> & Partial<Pick<MenuItem, 'detail' | 'price' | 'image'>>
        ) => Promise<{ done: true } | { done: false, message: string }>;
        QueryReturnType: EffectfulQueryResult;
    };
    AddItem: {
        Action: (
            pool: PoolConnection,
            payload: Pick<MenuItem, 'parent_id' | 'title' > & Partial<Pick<MenuItem, 'detail' | 'price' | 'image' | 'is_available'>>
        ) => Promise<{ created: true, menu_item: Pick<MenuItem, 'id'> } | { created: false, message: string }>;
        QueryReturnType: EffectfulQueryResult;
    };
    ChangeItemDescription: {
        Action: (
            pool: PoolConnection,
            payload: Pick<MenuItem, 'menu_item_id' | 'title' | 'detail' | 'price' | 'image'>
        ) => Promise<{ done: true } | { done: false, message: string }>;
        QueryReturnType: EffectfulQueryResult;
    };
    ChangeItemAvailability: {
        Action: (
            pool: PoolConnection,
            payload: Pick<MenuItem, 'menu_item_id' | 'is_available'>
        ) => Promise<{ done: true } | { done: false, message: string }>;
        QueryReturnType: EffectfulQueryResult;
    };
    DeleteItem: {
        Action: (
            pool: PoolConnection,
            payload: Pick<MenuItem, 'menu_item_id'>
        ) => Promise<{ deleted: true } | { deleted: false, message: string }>;
        QueryReturnType: EffectfulQueryResult;
    };
};

const Get: MenuOperation['Get']['Action'] = (pool) => {
    return new Promise((resolve, reject) => {
        pool.query(MenuOperationQuery.Get, (err, results) => {
            if (err) {
                reject({ getMenuError: err });
                return;
            }

            const parsed = results as MenuOperation['Get']['QueryReturnType'];

            if (!parsed.length) {
                resolve({ found: false, message: 'Could not find menu items' });
                return;
            }

            const menuTree = fromMenuItemListToMenuTree(parsed);

            resolve({ found: true, menu: menuTree });
        });
    });
};

const AddItemDescription: MenuOperation['AddItemDescription']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(MenuOperationQuery.AddItemDescription, [payload.menu_item_id, payload.title, payload.detail, payload.price, payload.image], (err, results) => {
            if (err) {
                reject(err);
                return;
            }

            const parsed = results as MenuOperation['AddItemDescription']['QueryReturnType'];

            if (!parsed.affectedRows) {
                resolve({ done: false, message: 'Could not add the menu item description' });
                return;
            }

            resolve({ done: true });
        });
    });
};

const AddItem: MenuOperation['AddItem']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.beginTransaction((err0) => {
            if (err0) {
                reject({ addItemBeginTransactionError: err0 });
                return;
            }

            const isAvailableByDefault = payload.is_available === undefined ? 1 : payload.is_available;

            pool.query(MenuOperationQuery.AddItem, [payload.parent_id, isAvailableByDefault], (err1, results) => {
                if (err1) {
                    pool.rollback(() => {
                        reject({ addItemError: err1 });
                    });
                    return;
                }

                const parsed = results as MenuOperation['AddItem']['QueryReturnType'];

                if (!parsed.affectedRows) {
                    pool.rollback(() => {
                        resolve({ created: false, message: 'Could not add the menu item' });
                    });
                    return;
                }

                const descriptionByDefault = {
                    menu_item_id: parsed.insertId,
                    title: payload.title,
                    detail: payload.detail ?? null,
                    price: payload.price ?? null,
                    image: payload.image ?? null,
                };

                AddItemDescription(pool, descriptionByDefault)
                .then((res) => {
                    if (!res.done) {
                        pool.rollback(() => {
                            resolve({ created: false, message: res.message });
                        });
                        return;
                    }

                    pool.commit((err2) => {
                        if (err2) {
                            pool.rollback(() => {
                                reject({ addItemCommitTransactionError: err2 });
                            });
                            return;
                        }

                        resolve({ created: true, menu_item: { id: parsed.insertId } });
                    });
                })
                .catch((err2) => {
                    pool.rollback(() => {
                        reject({ addItemDescriptionError: err2 });
                    });
                });
            })
        });
    });
};

const ChangeItemAvailability: MenuOperation['ChangeItemAvailability']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(MenuOperationQuery.ChangeItemAvailability, [payload.is_available ? 1 : 0, payload.menu_item_id], (err, results) => {
            if (err) {
                reject({ changeItemAvailabilityError: err });
                return;
            }

            const parsed = results as MenuOperation['ChangeItemAvailability']['QueryReturnType'];
            
            if (!parsed.changedRows) {
                resolve({ done: false, message: 'Could not change menu item availability' });
                return;
            }

            resolve({ done: true });
        });
    });
};

const ChangeItemDescription: MenuOperation['ChangeItemDescription']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(MenuOperationQuery.ChangeItemDescription, [payload.title, payload.title, payload.detail, payload.price, payload.image, payload.menu_item_id], (err, results) => {
            if (err) {
                reject({ changeItemAvailabilityError: err });
                return;
            }

            const parsed = results as MenuOperation['ChangeItemDescription']['QueryReturnType'];

            if (!parsed.changedRows) {
                resolve({ done: false, message: 'Could not change the menu item description' });
            }

            resolve({ done: true });
        });
    });
};

const DeleteItem: MenuOperation['DeleteItem']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(MenuOperationQuery.DeleteItem, [payload.menu_item_id], (err, results) => {
            if (err) {
                reject({ deleteItemError: err });
                return;
            }

            const parsed = results as MenuOperation['DeleteItem']['QueryReturnType'];

            if (!parsed.affectedRows) {
                resolve({ deleted: false, message: 'Could not delete the menu item' });
            }

            resolve({ deleted: true });
        });
    });
};

const Menu = {
    Get,
    AddItem,
    ChangeItemDescription,
    ChangeItemAvailability,
    DeleteItem,
};

export default Menu;
