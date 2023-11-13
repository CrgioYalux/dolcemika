import type { PoolConnection } from "mysql";

enum InventoryOperationQuery {
    Get = `
        SELECT
            i.id AS ingredient_id,
            i.title,
            i.detail,
            ist.stock
        FROM 
            ingredient i
        JOIN 
            ingredient_stock ist
        ON
            i.id = ist.ingredient_id
    `,
    ChangeIngredientStock = `
        UPDATE 
            ingredient_stock ist
        SET
            ist.stock = ?
        WHERE
            ist.ingredient_id = ?
    `,
    ChangeIngredientDescription = `
        UPDATE
            ingredient i
        SET
            i.title = IF(? IS NULL, i.title, ?),
            i.detail = ?
        WHERE
            i.id = ?
    `,
    CreateIngredientDescription = `
        INSERT INTO
            ingredient (title, detail)
        VALUES
            (?, ?)
    `,
    CreateIngredientStock = `
        INSERT INTO
            ingredient_stock (ingredient_id, stock)
        VALUES
            (?, ?)
    `,
    DeleteIngredient = `
        DELETE FROM
            ingredient i
        WHERE
            i.id = ?
    `,
};

interface InventoryOperation {
    Get: {
        Action: (
            pool: PoolConnection
        ) => Promise<{ found: true, inventory: Inventory } | { found: false, message: string }>;
        QueryReturnType: EffectlessQueryResult<Ingredient>;
    };
    ChangeIngredientStock: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Ingredient, 'ingredient_id' | 'stock'>
        ) => Promise<{ done: true } | { done: false, message: string }>;
        QueryReturnType: EffectfulQueryResult;
    };
    ChangeIngredientDescription: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Ingredient, 'ingredient_id'> & Partial<Pick<Ingredient, 'title' | 'detail'>>
        ) => Promise<{ done: true } | { done: false, message: string }>;
        QueryReturnType: EffectfulQueryResult;
    };
    CreateIngredientDescription: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Ingredient, 'title'> & Partial<Pick<Ingredient, 'detail'>>
        ) => Promise<{ created: true, ingredient: Pick<Ingredient, 'ingredient_id'> } | { created: false, message: string }>;
        QueryReturnType: EffectfulQueryResult;
    };
    CreateIngredientStock: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Ingredient, 'ingredient_id'> & Partial<Pick<Ingredient, 'stock'>>
        ) => Promise<{ created: true } | { created: false, message: string }>;
        QueryReturnType: EffectfulQueryResult;
    };
    CreateIngredient: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Ingredient, 'title'> & Partial<Pick<Ingredient, 'detail' | 'stock'>>
        ) => Promise<{ created: true, ingredient: Pick<Ingredient, 'ingredient_id'> } | { created: false, message: string }>;
    };
    DeleteIngredient: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Ingredient, 'ingredient_id'>
        ) => Promise<{ deleted: true } | { deleted: false, message: string }>;
        QueryReturnType: EffectfulQueryResult;
    };
};

const Get: InventoryOperation['Get']['Action'] = (pool) => {
    return new Promise((resolve, reject) => {
        pool.query(InventoryOperationQuery.Get, (err, results) => {
            if (err) {
                reject({ getInventoryError: err });
                return;
            }

            const parsed = results as InventoryOperation['Get']['QueryReturnType'];

            if (!parsed.length) {
                resolve({ found: false, message: 'Could not find ingredients in the inventory' });
                return;
            }
            
            resolve({ found: true, inventory: parsed });
        });
    });
};

const ChangeIngredientStock: InventoryOperation['ChangeIngredientStock']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        if (payload.stock < 0) {
            resolve({ done: false, message: 'Could not set ingredient stock because a negative number was passed' });
            return;
        }

        pool.query(InventoryOperationQuery.ChangeIngredientStock, [payload.stock, payload.ingredient_id], (err, results) => {
            if (err) {
                reject({ changeIngredientStockError: err });
                return;
            }

            const parsed = results as InventoryOperation['ChangeIngredientStock']['QueryReturnType'];

            if (!parsed.changedRows) {
                resolve({ done: false, message: 'Could not find an ingredient with that ID' });
                return;
            }

            resolve({ done: true });
        });
    });
};

const ChangeIngredientDescription: InventoryOperation['ChangeIngredientDescription']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(InventoryOperationQuery.ChangeIngredientDescription, [payload.title ?? null, payload.title ?? null, payload.detail ?? null, payload.ingredient_id], (err, results) => {
            if (err) {
                reject({ changeIngredientDescriptionError: err });
                return;
            }

            const parsed = results as InventoryOperation['ChangeIngredientDescription']['QueryReturnType'];

            if (!parsed.changedRows) {
                resolve({ done: false, message: 'Could not find an ingredient with that ID' });
                return;
            }

            resolve({ done: true });
        });
    });
};

const CreateIngredientDescription: InventoryOperation['CreateIngredientDescription']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(InventoryOperationQuery.CreateIngredientDescription, [payload.title, payload.detail ?? null], (err, results) => {
            if (err) {
                reject(err);
                return;
            }

            const parsed = results as InventoryOperation['CreateIngredientDescription']['QueryReturnType'];

            if (!parsed.affectedRows) {
                resolve({ created: false, message: 'Could not create the ingredient description' });
                return;
            }

            resolve({ created: true, ingredient: { ingredient_id: parsed.insertId } });
        });
    });
};

const CreateIngredientStock: InventoryOperation['CreateIngredientStock']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        const stock = payload.stock ?? 0;

        if (stock < 0) {
            resolve({ created: false, message: 'Could not set ingredient stock because a negative number was passed' });
            return;
        }

        pool.query(InventoryOperationQuery.CreateIngredientStock, [payload.ingredient_id, stock], (err, results) => {
            if (err) {
                reject(err);
                return;
            }

            const parsed = results as InventoryOperation['CreateIngredientStock']['QueryReturnType'];

            if (!parsed.affectedRows) {
                resolve({ created: false, message: 'Could not create the ingredient stock' });
                return;
            }

            resolve({ created: true });
        });
    });
};

const CreateIngredient: InventoryOperation['CreateIngredient']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.beginTransaction((err0) => {
            if (err0) {
                reject({ createIngredientBeginTransactionError: err0 });
                return;
            }

            CreateIngredientDescription(pool, { title: payload.title, detail: payload.detail })
            .then((res0) => {
                if (!res0.created) {
                    pool.rollback(() => {
                        resolve(res0);
                    });
                    return;
                }

                CreateIngredientStock(pool, { ingredient_id: res0.ingredient.ingredient_id, stock: payload.stock })
                .then((res1) => {
                    if (!res1.created) {
                        pool.rollback(() => {
                            resolve(res1);
                        });
                        return;
                    }

                    resolve(res0);
                })
                .catch((err1) => {
                    pool.rollback(() => {
                        reject({ createIngredientStockError: err1 });
                    });
                });
            })
            .catch((err1) => {
                pool.rollback(() => {
                    reject({ createIngredientDescriptionError: err1 });
                });
            });
        });
    });
};

const DeleteIngredient: InventoryOperation['DeleteIngredient']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(InventoryOperationQuery.DeleteIngredient, [payload.ingredient_id], (err, results) => {
            if (err) {
                reject({ deleteIngredientError: err });
                return;
            }

            const parsed = results as InventoryOperation['DeleteIngredient']['QueryReturnType'];

            if (!parsed.affectedRows) {
                resolve({ deleted: false, message: 'Could not find an ingredient with that ID' });
                return;
            }

            resolve({ deleted: true });
        });
    });
};

const Inventory = {
    Get,
    CreateIngredient,
    ChangeIngredientDescription,
    ChangeIngredientStock,
    DeleteIngredient,
};

export default Inventory;
