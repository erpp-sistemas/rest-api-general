import { Sequelize } from "sequelize";
import {} from "dotenv/config";

export const connection_sql_server = data => {
    const connection = new Sequelize(data.db_name, process.env.SQL_SERVER_USER, process.env.SQL_SERVER_PASSWORD, {
        host: process.env.SQL_SERVER_IP,
        dialect: 'mssql',
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        options: {
            instanceName: 'SQLEXPRESS',
            encrypt: false,
            trustServerCertificate: true
        }
    });

    return connection;
};