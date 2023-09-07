import { Sequelize } from "sequelize";
import {} from "dotenv/config";

export const connection_sql_server = data => {
    const connection = new Sequelize(data.nombre_db, process.env.SQL_SERVER_USER, process.env.SQL_SERVER_PASSWORD, {
        host: process.env.SQL_SERVER_IP,
        dialect: 'mssql',
        dialectOptions: {
            options: {
                requestTimeout: 0
            }
        }
    });

    return connection;
};