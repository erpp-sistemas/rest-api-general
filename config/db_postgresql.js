import { Sequelize } from "sequelize";
import {} from 'dotenv/config';

/* export const connection_postgresql_sequelize = new Sequelize(
    process.env.POSTGRESQL_PORT,
    process.env.POSTGRESQL_IP,
    process.env.POSTGRESQL_USER,
    process.env.POSTGRESQL_PASSWORD,
    {
        dialect: 'postgress',
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
); */

export const connection_postgresql = data => {
    const connection = new Sequelize(data.db_name_postgresql, process.env.POSTGRESQL_USER, process.env.POSTGRESQL_PASSWORD, {
        host: process.env.POSTGRESQL_IP,
        dialect: 'postgres',
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        options: {
            encrypt: false,
            trustServerCertificate: true
        }
    });

    return connection;
};