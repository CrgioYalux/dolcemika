/// <reference path="./utils.d.ts" />

import http from 'http';

import environment from './environment';
import db from './db';
import app from './app';
import process from 'process';

const PORT = process.env.PORT ?? '4000';

function tryDBConnection(): Promise<{ connected: true }> {
    return new Promise((resolve, reject) => {
        environment.SHOW_LOGS && console.log('Testing database connection');

        db.pool.getConnection((err, connection) => {
            connection.release();

            if (err) {
                reject(err);
                return;
            }

            resolve({ connected: true });
        });
    });
}

function init(): void {
    tryDBConnection()
    .then(() => {
        environment.SHOW_LOGS && console.log('Successfully established connection with database');

        const server = http.createServer(app.create());

        server.listen(PORT, () => {
            console.log(`Server listening on port :${PORT}`);
        });
    })
    .catch((err) => {
        environment.SHOW_LOGS && console.log('Failed to established connection with database');

        environment.SHOW_LOGS && console.error(err);
    });
}

init();
