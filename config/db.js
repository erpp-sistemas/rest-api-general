import { Sequelize } from "sequelize";
import {} from "dotenv/config";

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.SQL_SERVER_IP,
    port: 1433,
    dialect: 'mssql',
    dialectOptions: {
        options: {
            requestTimeout: 0
        }
    }
});

export default sequelize;