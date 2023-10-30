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

        Controllers.Menu.Get(connection)
        .then((res) => {
            if (!res.found) {
                response.status(404).send({ message: res.message });
                return;
            }

            response.status(201).send({ menu: res.menu });
        })
        .catch(next);
    });
};

const Menu = {
    Get,
};

export default Menu;
