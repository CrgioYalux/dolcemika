import cors from 'cors';
import express from 'express';

import API from './api';

import Middlewares from './middlewares';

import type { Express } from 'express';

function create(): Express {
    const app = express();

    app.disable('x-powered-by');
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cors());

    app.get('/ping', (_req, res) => {
        res.status(200).send('pong').end();
    });

    app.use(Middlewares.Logs);
    app.use(API.Router.Users);
    app.use(API.Router.Menu);
    app.use(API.Router.Orders);
    // app.use(middlewares.clients.auth);
    // app.use(api.routers.resources);
    
    app.use(Middlewares.ErrorHandling);
    app.use(Middlewares.NotFound);
    
    return app;
};

const app = { create };

export default app;

