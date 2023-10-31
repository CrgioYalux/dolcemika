import type { PoolConnection } from 'mysql';

// TODO 
// - change state

enum OrderOperationQuery {
    Create = `
        INSERT INTO
            client_order (client_id, total_price, detail)
        VALUES (?, ?, ?)
    `,
    GetStates = `
        SELECT state FROM order_states
    `,
    Get = `
        SELECT * FROM ClientOrdersAtLastState
    `,
    GetById = `
        SELECT * FROM ClientOrdersAtLastState WHERE order_id = ?
    `,
    AddMenu = `
        INSERT INTO
            order_menu (order_id, body, detail, price)
        VALUES
            (?, ?, ?, ?)
    `,
    ChangeState = `
        INSERT INTO
            order_current_state (order_id, order_state_id)
        VALUES 
            (?, ?)
    `,
};

interface OrderOperation {
    Create: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Order, 'client_id' | 'total_price' | 'detail'> & { menu: (Pick<OrderMenu, 'price' | 'body' | 'detail'>)[] }
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
        ) => Promise<{ found: true, orders: ClientOrderAtLastState[] } | { found: false, message: string }>;
        QueryReturnType: EffectlessQueryResult<ClientOrderAtLastState>;
    };
    GetById: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Order, 'id'>
        ) => Promise<{ found: true, order: ClientOrderAtLastState } | { found: false, message: string }>;
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
            payload: Pick<Order, 'id' | 'state_id'>
        ) => Promise<{ done: true } | { done: false, message: string }>;
        QueryReturnType: EffectfulQueryResult;
    };
};

const Create: OrderOperation['Create']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        return pool.beginTransaction((err0) => {
            if (err0) {
                reject({ beginCreateOrderError: err0 });
                return;
            }


            pool.query(OrderOperationQuery.Create, [payload.client_id, payload.total_price, payload.detail], (err1, resultsCreateOrder) => {
                if (err1) {
                    pool.rollback(() => {
                        reject({ createOrderError: err1 });
                    });
                    return;
                }

                const parsed = resultsCreateOrder as OrderOperation['Create']['QueryReturnType'];

                if (!parsed.affectedRows) {
                    pool.rollback(() => {
                        resolve({ created: false, message: 'Could not create the order' });
                    });
                    return;
                }

                pool.query(OrderOperationQuery.AddMenu, [payload.menu.map(item => [parsed.insertId, item.body, item.detail, item.price])], (err2, resultsAddMenu) => {
                    if (err2) {
                        pool.rollback(() => {
                            reject({ addOrderMenuError: err2 });
                        });
                        return;
                    }

                    const parsed = resultsAddMenu as OrderOperation['AddMenu']['QueryReturnType'];

                    if (!parsed.affectedRows) {
                        pool.rollback(() => {
                            resolve({ created: false, message: 'Could not add the order menu' });
                        });
                        return;
                    }

                    pool.commit((err3) => {
                        if (err3) {
                            reject({ commitCreateClientTransactionError: err3 });
                            return;
                        }

                        resolve({ created: true });
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

const GetById: OrderOperation['GetById']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(OrderOperationQuery.GetById, [payload.id], (err, results) => {
            if (err) {
                reject({ getOrderByIdError: err });
                return;
            }

            const parsed = results as OrderOperation['GetById']['QueryReturnType'];

            if (!parsed.length) {
                resolve({ found: false, message: 'No order found with that id' });
                return;
            }

            resolve({ found: true, order: parsed[0] });
        });
    });
};

const ChangeState: OrderOperation['ChangeState']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(OrderOperationQuery.ChangeState, [payload.id, payload.state_id], (err, results) => {
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
