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

        Controllers.Menu.Get(connection)
        .then((res) => {
            connection.release();

            const status = res.found ? 302 : 404;
            response.status(status).send(res);
        })
        .catch(next);
    });
};

const Menu = {
    Get,
};

export default Menu;
