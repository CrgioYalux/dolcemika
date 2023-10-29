import jwt from 'jsonwebtoken';
import environment from '../environment';

import type { Request, Response, NextFunction } from "express";

const Auth = (request: Request, response: Response, next: NextFunction): void => {
    const authHeader = request.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);

        if (token) {
            jwt.verify(token, environment.SECRET_KEY, (err, decoded) => {
                if (err) {
                    response.status(403).json({ reason: 'Wrong/expired credentials' }).end();
                } else {
                    request.body.user = decoded;
                    next();
                }
            });
        } else {
            response.status(401).json({ reason: 'No token provided' }).end();
        }
    }
};

const ErrorHandling = (error: Error, request: Request, response: Response, next: NextFunction): void => {
    if (error) {
        environment.SHOW_LOGS && console.error(error);

        response.status(500).send({ message: 'Server Error' }).end();
    }

    next();
};

const NotFound = (request: Request, response: Response, next: NextFunction): void => {
    response.status(404).end();
};

const Logs = (request: Request, response: Response, next: NextFunction): void => {
    if (environment.SHOW_LOGS) {
        console.log(`
            ${request.method} ${request.url} at ${Date.now()}
        `);
    }

    next();
};

const Middlewares = {
    Auth,
    ErrorHandling,
    NotFound,
    Logs,
};

export default Middlewares;
