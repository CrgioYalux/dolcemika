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
            const error = new Error('Could not connect to database');
            next(error);
            return;
        }

        Controllers.Users.PublicFindById(connection, { id: Number(id) })
        .then((res) => {
            if (!res.found) {
                response.status(404).send({ message: res.message });
                return;
            }

            response.status(201).send({ user: res.user });
        })
        .catch(next);
    });
};

const Post = (request: Request<{}, {}, { email: string, password: string }>, response: Response, next: NextFunction): void => {
    if (!request.body.email || !request.body.password) {
        response.status(400).send({ message: '' }).end();
    }
    
};


const Users = {
    Get,
    Post
};

export { Users };
