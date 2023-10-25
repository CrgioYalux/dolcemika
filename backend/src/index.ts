/// <reference path="./utils.d.ts" />

import http from 'http';

import environment from './environment';
import db from './db';
import app from './app';

const PORT = process.env.PORT ?? '4000';

function init(): void {
    environment.SHOW_LOGS && console.log('Testing database connection');

    db.pool.getConnection((err, connection) => {
        if (err) {
            environment.SHOW_LOGS && console.log(`Error while attempting connection to database: ${err}`);
            return;
        }

        environment.SHOW_LOGS && console.log('Successfully established connection with database');

        connection.release();
    });

    const server = http.createServer(app.create());

    server.listen(PORT, () => {
        console.log(`Server listening on port :${PORT}`);
    });
};

init();
