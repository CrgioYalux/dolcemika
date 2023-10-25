import jwt from 'jsonwebtoken';
import environment from '../environment';

import type { Request, Response, NextFunction } from "express";

const auth = (request: Request, response: Response, next: NextFunction): void => {
    const authHeader = request.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);

        if (token) {
            jwt.verify(token, environment.SECRET_KEY, (err, decoded) => {
                if (err) {
                    response.status(403).json({ reason: 'Wrong/expired credentials' }).end();
                } else {
                    request.body.community_member = decoded;
                    next();
                }
            });
        } else {
            response.status(401).json({ reason: 'No token provided' }).end();
        }
    }
};

const clients = { auth };

export default clients;
