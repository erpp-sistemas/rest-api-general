import { Sequelize } from "sequelize";
import {} from "dotenv/config";

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    dialect: 'mssql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    options: {
        instanceName: 'SQLEXPRESS'
    }
});

export default sequelize;