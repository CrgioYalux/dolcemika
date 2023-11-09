import Controllers from '../../controllers';
import db from '../../db';

import type { NextFunction, Request, Response } from 'express';

const Get = (request: Request, response: Response, next: NextFunction): void => {
    const authHeader = request.headers.authorization;
    const session = response.locals.session as Session;

    if (authHeader !== undefined && session === undefined) {
        next();
        return;
    }

    db.pool.getConnection((err, connection) => {
        if (err) {
            connection.release();

            const error = new Error('Could not connect to database');
            next(error);

            return;
        }

        const asRole = !authHeader || session?.role === 'client' ? 'client' : 'admin'

        Controllers.Menu.Get(connection, { asRole })
        .then((res) => {
            connection.release();

            const status = res.found ? 200 : 404;
            response.status(status).send(res);
        })
        .catch(next);
    });
};

type PostMenuItemRequestBody = Pick<MenuItem, 'parent_id' | 'title'> & Partial<Pick<MenuItem, 'title' | 'detail' | 'price' | 'image' | 'is_available'>>;
const PostMenuItem = (request: Request<{}, {}, PostMenuItemRequestBody>, response: Response, next: NextFunction): void => {
    if (request.body.parent_id === undefined || request.body.title === undefined) {
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

        Controllers.Menu.AddItem(connection, request.body)
        .then((res) => {
            connection.release();

            const status = res.created ? 201 : 400;
            response.status(status).send(res);
        })
        .catch(next);
    });
};

type PutMenuItemRequestBody = Pick<MenuItem, 'is_available'> & Partial<Pick<MenuItem, 'title' | 'detail' | 'price' | 'image'>>;
const PutMenuItemAvailability = (request: Request<Request['params'], {}, PutMenuItemRequestBody>, response: Response, next: NextFunction): void => {
    if (request.body.is_available === undefined) {
        next();
        return;
    }

    const id = request.params[0];

    if (id === undefined) {
        response.status(400).send({ message: 'No menu item ID provided' });
        return;
    }

    db.pool.getConnection((err, connection) => {
        if (err) {
            connection.release();
            
            const error = new Error('Could not connect to database');
            next(error);

            return;
        }

        Controllers.Menu.ChangeItemAvailability(connection, { menu_item_id: Number(id), ...request.body })
        .then((res) => {
            connection.release();

            if (request.body.title !== undefined || request.body.detail !== undefined || request.body.price !== undefined || request.body.image !== undefined) {
                // should go next
                next();
                return;
            }

            const status = res.done ? 200 : 400;
            response.status(status).send(res);
        })
        .catch(next);
    });
};

const PutMenuItemDescription = (request: Request<Request['params'], {}, Pick<MenuItem, 'title' | 'detail' | 'price' | 'image'>>, response: Response, next: NextFunction): void => {
    const id = request.params[0];
    
    if (id === undefined) {
        response.status(400).send({ message: 'No menu item ID provided' });
        return;
    }

    db.pool.getConnection((err, connection) => {
        if (err) {
            connection.release();

            const error = new Error('Could not connect to database');
            next(error);

            return;
        }

        Controllers.Menu.ChangeItemDescription(connection, { menu_item_id: Number(id), ...request.body })
        .then((res) => {
            connection.release();

            const status = res.done ? 200 : 400;
            response.status(status).send(res);
        })
        .catch(next);
    });
};

const DeleteMenuItem = (request: Request, response: Response, next: NextFunction): void => {
    const id = request.params[0];

    if (id === undefined) {
        response.status(400).send({ message: 'No menu item ID provided' });
        return;
    }

    db.pool.getConnection((err, connection) => {
        if (err) {
            connection.release();

            const error = new Error('Could not connect to database');
            next(error);

            return;
        }

        Controllers.Menu.DeleteItem(connection, { menu_item_id: Number(id) })
        .then((res) => {
            connection.release();

            const status = res.deleted ? 200 : 400;
            response.status(status).send(res);
        })
        .catch(next);
    });
};

const Menu = {
    Get,
    PostMenuItem,
    PutMenuItemAvailability,
    PutMenuItemDescription,
    DeleteMenuItem,
};

export default Menu;
