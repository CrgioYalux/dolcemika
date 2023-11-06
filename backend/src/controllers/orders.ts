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
        SELECT os.id as state_id, os.state FROM order_states os
    `,
    GetStateByName = `
        SELECT * FROM order_states os WHERE os.state = ?
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
    GetStateHistory = `
        SELECT
            ocs.created_at,
            os.state,
            os.id as state_id
        FROM order_current_state ocs
        JOIN order_states os
        ON os.id = ocs.order_state_id
        WHERE ocs.order_id = ?
    `,
    GetOrderLastState = `
        SELECT
            *
        FROM OrdersInLastStateView oilsv
        WHERE oilsv.order_id = ?
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
        ) => Promise<{ found: true, states: Pick<Order, 'state_id' | 'state'>[] } | { found: false, message: string }>;
        QueryReturnType: EffectlessQueryResult<Pick<Order, 'state_id' | 'state'>>;
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
    GetStateHistory: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Order, 'order_id'>
        ) => Promise<{ found: true, states: Array<Pick<Order, 'created_at' | 'state_id' | 'state'>> } | { found: false, message: string }>;
        QueryReturnType: EffectlessQueryResult<Pick<Order, 'created_at' | 'state_id' | 'state'>>;
    };
    GetLastState: {
        QueryReturnType: EffectlessQueryResult<Pick<Order, 'order_id' | 'last_state_at' | 'state_id' | 'state'>>;
    };
    ChangeToNextState: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Order, 'order_id'>
        ) => Promise<{ done: true } | { done: false, message: string }>
        QueryReturnType: EffectlessQueryResult<Pick<Order, 'order_id' | 'last_state_at' | 'state_id' | 'state'>>;
    };
    ChangeToPausedState: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Order, 'order_id'>
        ) => Promise<{ done: true } | { done: false, message: string }>
        QueryReturnType: EffectlessQueryResult<Pick<Order, 'order_id' | 'last_state_at' | 'state_id' | 'state'>>;
    };
    ChangeToRevisingState: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Order, 'order_id'>
        ) => Promise<{ done: true } | { done: false, message: string }>
        QueryReturnType: EffectlessQueryResult<Pick<Order, 'order_id' | 'last_state_at' | 'state_id' | 'state'>>;
    };
    ChangeToCanceledState: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Order, 'order_id'>
        ) => Promise<{ done: true } | { done: false, message: string }>
        QueryReturnType: EffectlessQueryResult<Pick<Order, 'order_id' | 'last_state_at' | 'state_id' | 'state'>>;
    };
    ChangeToFinishedState: {
        Action: (
            pool: PoolConnection,
            payload: Pick<Order, 'order_id'>
        ) => Promise<{ done: true } | { done: false, message: string }>
        QueryReturnType: EffectlessQueryResult<Pick<Order, 'order_id' | 'last_state_at' | 'state_id' | 'state'>>;
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

const ChangeToNextState: OrderOperation['ChangeToNextState']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.beginTransaction((err0) => {
            if (err0) {
                reject({ changeToNextStateBeginTransactionError: err0 });
                return;
            }

            pool.query(OrderOperationQuery.GetOrderLastState, [payload.order_id], (err1, results1) => {
                if (err1) {
                    pool.rollback(() => {
                        reject({ getOrderStatesError: err1 });
                    });
                    return;
                }

                const parsed1 = results1 as OrderOperation['GetLastState']['QueryReturnType'];

                if (!parsed1.length) {
                    pool.rollback(() => {
                        resolve({ done: false, message: 'Could not find the next logical state' });
                    });
                    return;
                }

                pool.query(OrderOperationQuery.GetStates, (err2, results2) => {
                    if (err2) {
                        pool.rollback(() => {
                            reject({ getStatesError: err2 });
                        });
                        return;
                    }

                    const parsed2 = results2 as OrderOperation['GetStates']['QueryReturnType'];

                    if (!parsed2.length) {
                        pool.rollback(() => {
                            resolve({ done: false, message: 'Could not find all of order possible states' });
                        });
                        return;
                    }

                    const lastState = parsed1[0];
                    let stateToFind: OrderPossibleState | '' = '';

                    if (lastState.state === 'just arrived') {
                        stateToFind = 'accepted';
                    } else if (lastState.state === 'accepted' || lastState.state === 'paused') {
                        stateToFind = 'started';
                    } else if (lastState.state === 'started') {
                        stateToFind = 'to be delivered';
                    } else if (lastState.state === 'to be delivered') {
                        stateToFind = 'finished';
                    }

                    const nextState = parsed2.find((v) => v.state === stateToFind);

                    if (!nextState) {
                        pool.rollback(() => {
                            resolve({ done: false, message: 'Could not find the next logical state' });
                        });
                        return;
                    }

                    ChangeState(pool, { order_id: payload.order_id, state_id: nextState.state_id })
                    .then((res) => {
                        if (!res.done) {
                            pool.rollback(() => {
                                resolve({ done: false, message: 'Could not change the state' });
                            });
                            return;
                        }

                        pool.commit((err4) => {
                            if (err4) {
                                pool.rollback(() => {
                                    reject({ changeToNextStateCommitTransactionError: err4 });
                                });
                                return;
                            }

                            resolve({ done: true });
                        });
                    })
                    .catch((err3) => {
                        pool.rollback(() => {
                            reject(err3);
                        });
                    });
                });
            });
        });
    });
};

const ChangeToPausedState: OrderOperation['ChangeToPausedState']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.beginTransaction((err0) => {
            if (err0) {
                reject({ changeToPausedStateError: err0 });
                return;
            }

            pool.query(OrderOperationQuery.GetStates, (err1, results1) => {
                if (err1) {
                    pool.rollback(() => {
                        reject({ getStatesError: err1 });
                    });
                    return;
                }

                const parsed1 = results1 as OrderOperation['ChangeToPausedState']['QueryReturnType'];

                if (!parsed1.length) {
                    pool.rollback(() => {
                        resolve({ done: false, message: 'Could not find all of order possible states' });
                    });
                    return;
                }

                const pausedState = parsed1.find((v) => v.state === 'paused');

                if (!pausedState) {
                    pool.rollback(() => {
                        resolve({ done: false, message: 'Could not find the paused state' });
                    });
                    return;
                }

                ChangeState(pool, { order_id: payload.order_id, state_id: pausedState.state_id })
                .then((res) => {
                    if (!res.done) {
                        pool.rollback(() => {
                            resolve({ done: false, message: 'Could not change the state' });
                        });
                        return;
                    }

                    pool.commit((err2) => {
                        if (err2) {
                            reject({ changeToPausedStateError: err2 });
                            return;
                        }

                        resolve({ done: true });
                    });
                })
                .catch((err2) => {
                    pool.rollback(() => {
                        reject({ changeStateError: err2 });
                    });
                    return;
                });
            });
        });
    });
};

const ChangeToRevisingState: OrderOperation['ChangeToRevisingState']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.beginTransaction((err0) => {
            if (err0) {
                reject({ changeToRevisingStateError: err0 });
                return;
            }

            pool.query(OrderOperationQuery.GetStates, (err1, results1) => {
                if (err1) {
                    pool.rollback(() => {
                        reject({ getStatesError: err1 });
                    });
                    return;
                }

                const parsed1 = results1 as OrderOperation['ChangeToRevisingState']['QueryReturnType'];

                if (!parsed1.length) {
                    pool.rollback(() => {
                        resolve({ done: false, message: 'Could not find all of order possible states' });
                    });
                    return;
                }

                const revisingState = parsed1.find((v) => v.state === 'revising');

                if (!revisingState) {
                    pool.rollback(() => {
                        resolve({ done: false, message: 'Could not find the revising state' });
                    });
                    return;
                }

                ChangeState(pool, { order_id: payload.order_id, state_id: revisingState.state_id })
                .then((res) => {
                    if (!res.done) {
                        pool.rollback(() => {
                            resolve({ done: false, message: 'Could not change the state' });
                        });
                        return;
                    }

                    pool.commit((err2) => {
                        if (err2) {
                            reject({ changeToRevisingStateError: err2 });
                            return;
                        }

                        resolve({ done: true });
                    });
                })
                .catch((err2) => {
                    pool.rollback(() => {
                        reject({ changeStateError: err2 });
                    });
                    return;
                });
            });
        });
    });
};

const ChangeToCanceledState: OrderOperation['ChangeToCanceledState']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.beginTransaction((err0) => {
            if (err0) {
                reject({ changeToCanceledStateError: err0 });
                return;
            }

            pool.query(OrderOperationQuery.GetStates, (err1, results1) => {
                if (err1) {
                    pool.rollback(() => {
                        reject({ getStatesError: err1 });
                    });
                    return;
                }

                const parsed1 = results1 as OrderOperation['ChangeToCanceledState']['QueryReturnType'];

                if (!parsed1.length) {
                    pool.rollback(() => {
                        resolve({ done: false, message: 'Could not find all of order possible states' });
                    });
                    return;
                }

                const canceledState = parsed1.find((v) => v.state === 'canceled');

                if (!canceledState) {
                    pool.rollback(() => {
                        resolve({ done: false, message: 'Could not find the canceled state' });
                    });
                    return;
                }

                ChangeState(pool, { order_id: payload.order_id, state_id: canceledState.state_id })
                .then((res) => {
                    if (!res.done) {
                        pool.rollback(() => {
                            resolve({ done: false, message: 'Could not change the state' });
                        });
                        return;
                    }

                    pool.commit((err2) => {
                        if (err2) {
                            reject({ changeToCanceledStateError: err2 });
                            return;
                        }

                        resolve({ done: true });
                    });
                })
                .catch((err2) => {
                    pool.rollback(() => {
                        reject({ changeStateError: err2 });
                    });
                    return;
                });
            });
        });
    });
};

const ChangeToFinishedState: OrderOperation['ChangeToFinishedState']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.beginTransaction((err0) => {
            if (err0) {
                reject({ changeToFinishedStateError: err0 });
                return;
            }

            pool.query(OrderOperationQuery.GetStates, (err1, results1) => {
                if (err1) {
                    pool.rollback(() => {
                        reject({ getStatesError: err1 });
                    });
                    return;
                }

                const parsed1 = results1 as OrderOperation['ChangeToFinishedState']['QueryReturnType'];

                if (!parsed1.length) {
                    pool.rollback(() => {
                        resolve({ done: false, message: 'Could not find all of order possible states' });
                    });
                    return;
                }

                const finishedState = parsed1.find((v) => v.state === 'finished');

                if (!finishedState) {
                    pool.rollback(() => {
                        resolve({ done: false, message: 'Could not find the finished state' });
                    });
                    return;
                }

                ChangeState(pool, { order_id: payload.order_id, state_id: finishedState.state_id })
                .then((res) => {
                    if (!res.done) {
                        pool.rollback(() => {
                            resolve({ done: false, message: 'Could not change the state' });
                        });
                        return;
                    }

                    pool.commit((err2) => {
                        if (err2) {
                            reject({ changeToFinishedStateError: err2 });
                            return;
                        }

                        resolve({ done: true });
                    });
                })
                .catch((err2) => {
                    pool.rollback(() => {
                        reject({ changeStateError: err2 });
                    });
                    return;
                });
            });
        });
    });
};

const GetStateHistory: OrderOperation['GetStateHistory']['Action'] = (pool, payload) => {
    return new Promise((resolve, reject) => {
        pool.query(OrderOperationQuery.GetStateHistory, [payload.order_id], (err, results) => {
            if (err) {
                reject({ getOrderStatesError: err });
                return;
            }

            const parsed = results as OrderOperation['GetStateHistory']['QueryReturnType'];

            if (!parsed.length) {
                resolve({ found: false, message: 'Could not find the order states' });
                return;
            }

            resolve({ found: true, states: parsed });
        });
    });
};

const Orders = {
    Create,
    GetStates,
    Get,
    GetById,
    ChangeState,
    ChangeToNextState,
    ChangeToPausedState,
    ChangeToRevisingState,
    ChangeToCanceledState,
    ChangeToFinishedState,
    GetStateHistory,
};

export default Orders;
