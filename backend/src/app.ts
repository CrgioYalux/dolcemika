import cors from 'cors';
import express from 'express';

import environment from './environment';

import type { Express } from 'express';

function create(): Express {
    const app = express();

    app.disable('x-powered-by');
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cors());

    environment.SHOW_LOGS && app.all('/**', (req, _res, next) => {
        console.log(`
            ${req.method} ${req.url} at ${Date.now()}
        `);
        next();
    });

    app.get('/ping', (_req, res) => {
        res.status(200).send('pong').end();
    });

    // app.use(api.routers.login);
    // app.use(middlewares.clients.auth);
    // app.use(api.routers.resources);

    app.all('/**', (_req, res) => {
        res.status(404).end();
    });

    return app;
};

const app = { create };

export default app;

