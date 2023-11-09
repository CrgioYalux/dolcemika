import Controllers from '../../controllers';
import db from '../../db';

import type { NextFunction, Request, Response } from 'express';

const Get = (request: Request, response: Response, next: NextFunction): void => {
    db.pool.getConnection((err, connection) => {
        if (err) {
            connection.release();

            const error = new Error('Could not connect to database');
            next(error);

            return;
        }

        Controllers.Inventory.Get(connection)
        .then((res) => {
            connection.release();

            const status = res.found ? 200 : 404;
            response.status(status).send(res);
        })
        .catch(next);
    });
};

type PostIngredientRequestBody = Pick<Ingredient, 'title'> & Partial<Pick<Ingredient, 'detail' | 'stock'>>;
const PostIngredient = (request: Request<{}, {}, PostIngredientRequestBody>, response: Response, next: NextFunction): void => {
    if (request.body.title === undefined) {
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

        Controllers.Inventory.CreateIngredient(connection, request.body)
        .then((res) => {
            connection.release();

            const status = res.created ? 201 : 400;
            response.status(status).send(res);
        })
        .catch(next);
    });
};

type PutIngredientStockRequestBody = Pick<Ingredient, 'stock'> & Partial<Pick<Ingredient, 'title' | 'detail'>>;
const PutIngredientStock = (request: Request<Request['params'], {}, PutIngredientStockRequestBody>, response: Response, next: NextFunction): void => {
    if (request.body.stock === undefined) {
        next();
        return;
    }

    const id = request.params[0];

    if (id === undefined) {
        response.status(400).send({ message: 'No ingredient ID provided' });
        return;
    }

    db.pool.getConnection((err, connection) => {
        if (err) {
            connection.release();

            const error = new Error('Could not connect to database');
            next(error);

            return;
        }

        Controllers.Inventory.ChangeIngredientStock(connection, { ingredient_id: Number(id), stock: request.body.stock })
        .then((res) => {
            connection.release();
            
            if (request.body.title !== undefined || request.body.detail !== undefined) {
                next();
                return;
            }
            // see if it's possible to continue

            const status = res.done ? 200 : 400;
            response.status(status).send(res);
        })
        .catch(next);
    });
};

const PutIngredientDescription = (request: Request<Request['params'], {}, Partial<Pick<Ingredient, 'title' | 'detail'>>>, response: Response, next: NextFunction): void => {
    const id = request.params[0];

    if (id === undefined) {
        response.status(400).send({ message: 'No ingredient ID provided' });
        return;
    }

    db.pool.getConnection((err, connection) => {
        if (err) {
            connection.release();

            const error = new Error('Could not connect to database');
            next(error);

            return;
        }

        Controllers.Inventory.ChangeIngredientDescription(connection, { ingredient_id: Number(id), title: request.body.title, detail: request.body.detail })
        .then((res) => {
            connection.release();

            const status = res.done ? 200 : 400;
            response.status(status).send(res);
        })
        .catch(next);
    });
};

const DeleteIngredient = (request: Request, response: Response, next: NextFunction): void => {
    const id = request.params[0];

    if (id === undefined) {
        response.status(400).send({ message: 'No ingredient ID provided' });
        return;
    }

    db.pool.getConnection((err, connection) => {
        if (err) {
            connection.release();

            const error = new Error('Could not connect to database');
            next(error);

            return;
        }

        Controllers.Inventory.DeleteIngredient(connection, { ingredient_id: Number(id) })
        .then((res) => {
            connection.release();

            const status = res.deleted ? 200 : 400;
            response.status(status).send(res);
        })
        .catch(next);
    });
};

const Inventory = {
    Get,
    PostIngredient,
    PutIngredientStock,
    PutIngredientDescription,
    DeleteIngredient,
};

export default Inventory;
