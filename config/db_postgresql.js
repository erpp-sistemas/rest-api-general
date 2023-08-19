import { Sequelize } from "sequelize";
import {} from 'dotenv/config';

export const connection_postgresql = data => {
    const connection = new Sequelize(data.db_name_postgresql, process.env.POSTGRESQL_USER, process.env.POSTGRESQL_PASSWORD, {
        host: process.env.POSTGRESQL_IP,
        dialect: 'postgres',
        dialectOptions: {
            requestTimeout: 30000
        },
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