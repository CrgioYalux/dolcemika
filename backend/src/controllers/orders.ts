import type { PoolConnection } from 'mysql';

enum OrderOperationQuery {
    CreateOrder = `
        INSERT INTO
            client_order (client_id)
        VALUES (?)
    `,
    CreateDescription = `
        INSERT INTO
            client_order_description (order_id, detail, total_price)
        VALUES (?, ?, ?)
    `,
    AddMenu = `
        INSERT INTO
            order_menu (order_id, body, detail, price)
        VALUES
            ?
    `,
    GetStates = `
        SELECT state FROM order_states
    `,
    Get = `
        SELECT * FROM OrdersDescribedInLastStateView
    `,
    GetMenuById = `
        SELECT om.price, om.detail, om.body FROM order_menu om JOIN client_order co ON co.id = om.order_id WHERE co.id = ?
    `,
    GetById = `
        SELECT * FROM ClientOrdersAtLastState WHERE order_id = ?
    `,
    ChangeState = `
        INSERT INTO
            order_current_state (order_id, order_state_id)
        VALUES 
            (?, ?)
    `,
    GetClientOrdersById = `
        SELECT
            co.id AS order_id,
            co.total_price,
            co.created_at,
            co.estimated_for,
            co.detail
        FROM client_order co
        JOIN user_client uc ON uc.id = co.client_id
        JOIN user u ON u.id = uc.user_id
        WHERE u.id = ?
    `,
};

interface OrderOperation {
    CreateOrder: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Order, 'client_id'>
        ) => Promise<{ created: true, order: Pick<Order, 'order_id'> } | { created: false, message: string }>;
        QueryReturnType: EffectfulQueryResult;
    };
    CreateDescription: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Order, 'order_id' | 'total_price'> &
                     Partial<Pick<Order, 'detail'>> &
                     { menu: Array<Pick<OrderMenu, 'body' | 'price'> & Partial<Pick<OrderMenu, 'detail'>>> }
        ) => Promise<{ created: true } | { created: false, message: string }>;
        QueryReturnType: EffectfulQueryResult;
    };
    Create: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Order, 'client_id' | 'total_price'> &
                     Partial<Pick<Order, 'detail'>> &
                     { menu: Array<Pick<OrderMenu, 'body' | 'price'> & Partial<Pick<OrderMenu, 'detail'>>> }
        ) => Promise<{ created: true } | { created: false, message: string }>;
        QueryReturnType: EffectfulQueryResult;
    };
    GetStates: {
        Action: (
            pool: PoolConnection
        ) => Promise<{ found: true, states: Pick<Order, 'state'>[] } | { found: false, message: string }>;
        QueryReturnType: EffectlessQueryResult<Pick<Order, 'state'>>;
    };
    Get: {
        Action: (
            pool: PoolConnection
        ) => Promise<{ found: true, orders: Array<ClientOrderAtLastState> } | { found: false, message: string }>;
        QueryReturnType: EffectlessQueryResult<ClientOrderAtLastState>;
    };
    GetMenuById: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Order, 'order_id'>
        ) => Promise<{ found: true, menu: Array<Pick<OrderMenu, 'body' | 'detail' | 'price'>> } | { found: false, message: string }>;
        QueryReturnType: EffectlessQueryResult<Pick<OrderMenu, 'body' | 'detail' | 'price'>>;
    };
    GetById: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Order, 'order_id'>
        ) => Promise<{ found: true, order: (ClientOrderAtLastState & { menu: Array<Pick<OrderMenu, 'body' | 'detail' | 'price'>> })} | { found: false, message: string }>;
        QueryReturnType: EffectlessQueryResult<ClientOrderAtLastState>;
    };
    AddMenu: {
        Action: (
            pool: PoolConnection,
            payload: Pick<OrderMenu, 'order_id' | 'body' | 'detail' | 'price'>
        ) => Promise<{ created: true } | { created: false, message: string }>;
        QueryReturnType: EffectfulQueryResult;
    };
    ChangeState: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Order, 'order_id' | 'state_id'>
        ) => Promise<{ done: true } | { done: false, message: string }>;
        QueryReturnType: EffectfulQueryResult;
    };
};

const Create: OrderOperation['Create']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        return pool.beginTransaction((err0) => {
            if (err0) {
                reject({ createOrderBeginTransactionError: err0 });
                return;
            }

            if (payload.menu.length === 0) {
                resolve({ created: false, message: 'Could not create the order because the menu is empty' });
                return;
            }

            pool.query(OrderOperationQuery.CreateOrder, [payload.client_id], (err1, results1) => {
                if (err1) {
                    pool.rollback(() => {
                        reject({ createOrderError: err1 });
                    });
                    return;
                }

                const parsed1 = results1 as OrderOperation['Create']['QueryReturnType'];

                if (!parsed1.affectedRows) {
                    pool.rollback(() => {
                        resolve({ created: false, message: 'Could not create the order' });
                    });
                    return;
                }

                pool.query(OrderOperationQuery.CreateDescription, [parsed1.insertId, payload.detail ?? null, payload.total_price], (err2, results2) => {
                    if (err2) {
                        pool.rollback(() => {
                            reject({ createOrderDescriptionError: err2 });
                        });
                        return;
                    }

                    const parsed2 = results2 as OrderOperation['CreateDescription']['QueryReturnType'];

                    if (!parsed2.affectedRows) {
                        pool.rollback(() => {
                            resolve({ created: false, message: 'Could not add description to the order' });
                        });
                        return;
                    }

                    pool.query(OrderOperationQuery.AddMenu, [payload.menu.map(item => [parsed1.insertId, item.body, item.detail ?? null, item.price])], (err3, results3) => {
                        if (err3) {
                            pool.rollback(() => {
                                reject({ createOrderMenuError: err3 });
                            });
                            return;
                        }

                        const parsed3 = results3 as OrderOperation['AddMenu']['QueryReturnType'];

                        if (!parsed3.affectedRows) {
                            pool.rollback(() => {
                                resolve({ created: false, message: 'Could not add menu to the order' });
                            });
                            return;
                        }

                        pool.commit((err4) => {
                            if (err4) {
                                reject({ createOrderCommitTransactionError: err4 });
                                return;
                            }

                            resolve({ created: true });
                        });
                    });
                });
            });
        });
    });
};

const GetStates: OrderOperation['GetStates']['Action'] = (pool) => {
    return new Promise((resolve, reject) => {
        pool.query(OrderOperationQuery.GetStates, (err, results) => {
            if (err) {
                reject({ getStatesError: err });
                return;
            }

            const parsed = results as OrderOperation['GetStates']['QueryReturnType'];

            if (!parsed.length) {
                resolve({ found: false, message: 'No order states found' });
                return;
            }

            resolve({ found: true, states: parsed });
        });
    });
};

const Get: OrderOperation['Get']['Action'] = (pool) => {
    return new Promise((resolve, reject) => {
        pool.query(OrderOperationQuery.Get, (err, results) => {
            if (err) {
                reject({ getOrdersError: err });
                return;
            }

            const parsed = results as OrderOperation['Get']['QueryReturnType'];

            if (!parsed.length) {
                resolve({ found: false, message: 'No orders found' });
                return;
            }

            resolve({ found: true, orders: parsed });
        });
    });
};

const GetMenuById: OrderOperation['GetMenuById']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(OrderOperationQuery.GetMenuById, [payload.order_id], (err, results) => {
            if (err) {
                reject(err);
                return;
            }

            const parsed = results as OrderOperation['GetMenuById']['QueryReturnType'];

            if (!parsed.length) {
                resolve({ found: false, message: 'Could not find order menu' });
                return;
            }

            resolve({ found: true, menu: parsed });
        });
    });
};

const GetById: OrderOperation['GetById']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(OrderOperationQuery.GetById, [payload.order_id], (err0, results) => {
            if (err0) {
                reject({ getOrderByIdError: err0 });
                return;
            }

            const parsed = results as OrderOperation['GetById']['QueryReturnType'];

            if (!parsed.length) {
                resolve({ found: false, message: 'No order found with that id' });
                return;
            }

            GetMenuById(pool, payload)
            .then((res) => {
                if (!res.found) {
                    resolve(res);
                    return;
                }

                resolve({ found: true, order: { ...parsed[0], menu: res.menu } });
            })
            .catch((err1) => {
                reject({ getMenuByIdError: err1 });
            });

        });
    });
};

const ChangeState: OrderOperation['ChangeState']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(OrderOperationQuery.ChangeState, [payload.order_id, payload.state_id], (err, results) => {
            if (err) {
                reject({ changeStateError: err });
                return;
            }

            const parsed = results as OrderOperation['ChangeState']['QueryReturnType'];

            if (!parsed.affectedRows) {
                resolve({ done: false, message: 'Could not add the state to the order' });
                return;
            }

            resolve({ done: true });
        });
    });
};

const Orders = {
    Create,
    GetStates,
    Get,
    GetById,
    ChangeState,
};

export default Orders;
