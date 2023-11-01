import Controllers from '../../controllers';
import db from '../../db';

import type { NextFunction, Request, Response } from 'express';

const Get = (request: Request, response: Response, next: NextFunction): void => {
    const id = request.params[0];

    if (id === undefined) {
        response.status(400).send({ message: 'No user ID provided' });
        return;
    }

    db.pool.getConnection((err, connection) => {
        if (err) {
            connection.release();

            const error = new Error('Could not connect to the database');
            next(error);

            return;
        }

        Controllers.Users.PublicFindById(connection, { id: Number(id) })
        .then((res) => {
            connection.release();

            const status = res.found ? 302 : 404;
            response.status(status).send(res);
        })
        .catch(next);
    });
};

const PostClient = (request: Request<{}, {}, Pick<User, 'email' | 'password' | 'fullname' | 'cellphone' | 'birthdate'>>, response: Response, next: NextFunction): void => {
    if (!request.body.email || !request.body.password || !request.body.fullname || !request.body.cellphone || !request.body.birthdate) {
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

        Controllers.Users.CreateClient(connection, request.body)
        .then((res) => {
            connection.release();

            const status = res.created ? 201 : 400;
            response.status(status).send(res);
        })
        .catch(next);
    });
};

const Auth = (request: Request<{}, {}, Pick<User, 'email' | 'password'>>, response: Response, next: NextFunction): void => {
    if (!request.body.email || !request.body.password) {
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

        Controllers.Users.Auth(connection, request.body)
        .then((res) => {
            connection.release();

            const status = res.authenticated ? 200 : 401;
            response.status(status).send(res);
        })
        .catch(next);
    });
};

const Users = {
    Get,
    PostClient,
    Auth,
};

export default Users;
