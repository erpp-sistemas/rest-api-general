import { Sequelize } from "sequelize";
import {} from 'dotenv/config';

export const connection_postgresql = data => {
    const connection = new Sequelize(data.db_name_postgresql, process.env.POSTGRESQL_USER, process.env.POSTGRESQL_PASSWORD, {
        host: process.env.POSTGRESQL_IP,
        dialect: 'postgres'
    });

    return connection;
};