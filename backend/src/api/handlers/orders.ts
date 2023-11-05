import Controllers from '../../controllers';
import db from '../../db';

import type { NextFunction, Request, Response } from 'express';

type PostOrderMenuRequestBody = { menu: Array<Pick<OrderMenu, 'body' | 'price'> & Partial<Pick<OrderMenu, 'detail'>>> };
type PostOrderRequestBody = Pick<Order, 'client_id' | 'total_price'> & Partial<Pick<Order, 'detail'>>;
const Post = (request: Request<{}, {}, PostOrderMenuRequestBody & PostOrderRequestBody>, response: Response, next: NextFunction): void => {
    if (request.body.client_id === undefined || request.body.menu === undefined || request.body.menu.length === 0) {
        response.status(400).send({ message: 'Required fields are empty' });
        return;
    }

    db.pool.getConnection((err, connection) => {
        if (err) {
            connection.release();

            const error = new Error('Could not connect to database');
            next(error);

            return;
        }

        Controllers.Orders.Create(connection, request.body)
        .then((res) => {
            connection.release();

            const status = res.created ? 201 : 400;
            response.status(status).send(res);
        })
        .catch(next);
    });
};

const Get = (request: Request, response: Response, next: NextFunction): void => {
    db.pool.getConnection((err, connection) => {
        if (err) {
            connection.release();

            const error = new Error('Could not connect to database');
            next(error);

            return;
        }

        Controllers.Orders.Get(connection)
        .then((res) => {
            connection.release();

            const status = res.found ? 302 : 404;
            response.status(status).send(res);
        })
        .catch(next)
    });
};

const GetById = (request: Request, response: Response, next: NextFunction): void => {
    const id = request.params[0];

    if (id === undefined) {
        response.status(400).send({ message: 'No order ID provided' });
        return;
    }

    db.pool.getConnection((err, connection) => {
        if (err) {
            connection.release();

            const error = new Error('Could not connect to database');
            next(error);

            return;
        }

        Controllers.Orders.GetById(connection, { order_id: Number(id) })
        .then((res) => {
            connection.release();

            const status = res.found ? 302 : 404;
            response.status(status).send(res);
        })
        .catch(next);
    });
};

const GetStates = (request: Request, response: Response, next: NextFunction): void => {
    db.pool.getConnection((err, connection) => {
        if (err) {
            connection.release();

            const error = new Error('Could not connect to database');
            next(error);

            return;
        }

        Controllers.Orders.GetStates(connection)
        .then((res) => {
            connection.release();

            const status = res.found ? 302 : 404;
            response.status(status).send(res);
        })
        .catch(next);
    });
};

const PostState = (request: Request, response: Response, next: NextFunction): void => {
    const order_id = request.params[0];
    const state_id = request.params[1];

    if (order_id === undefined || state_id === undefined) {
        response.status(400).send({ message: 'No order ID or state ID provided' });
        return;
    }

    db.pool.getConnection((err, connection) => {
        if (err) { 
            connection.release();

            const error = new Error('Could not connect to database');
            next(error);

            return;
        }

        Controllers.Orders.ChangeState(connection, { order_id: Number(order_id), state_id: Number(state_id) })
        .then((res) => {
            connection.release();

            const status = res.done ? 201 : 400;
            response.status(status).send(res);
        })
        .catch(next);
    });
};

const Orders = {
    Post,
    Get,
    GetById,
    GetStates,
    PostState,
};

export default Orders;
