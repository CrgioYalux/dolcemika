import Controllers from '../../controllers';
import db from '../../db';

import type { NextFunction, Request, Response } from 'express';

const Get = (request: Request, response: Response, next: NextFunction): void => {
    db.pool.getConnection((err, connection) => {
        if (err) {
            const error = new Error('Could not connect to database');
            next(error);
            return;
        }

        Controllers.Orders.Get(connection)
        .then((res) => {
            if (!res.found) {
                response.status(404).send({ message: res.message });
                return;
            }

            response.status(200).send({ orders: res.orders });
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
            const error = new Error('Could not connect to database');
            next(error);
            return;
        }

        Controllers.Orders.GetById(connection, { id: Number(id) })
        .then((res) => {
            if (!res.found) {
                response.status(404).send({ message: res.message });
                return;
            }

            response.status(302).send({ order: res.order });
        })
        .catch(next);
    });
};

const Orders = {
    Get,
    GetById,
};

export default Orders;
