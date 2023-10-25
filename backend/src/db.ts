import mysql from 'mysql';
import environment from './environment';

const pool = mysql.createPool({
    multipleStatements: true,
    connectionLimit: 10,
    host: environment.DB.HOST,
    port: environment.DB.PORT,
    user: environment.DB.USER,
    password: environment.DB.PASS,
    database: environment.DB.NAME,
});

const db = { pool };

export default db;
