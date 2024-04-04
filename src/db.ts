import mariadb from 'mariadb';

const connectionPool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    port: Number(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME
});

export default connectionPool;