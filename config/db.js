import { Sequelize } from "sequelize";
import {} from "dotenv/config";

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    dialect: 'mssql',
    // host: 'localhost',
    // port: process.env.DB_PORT,
    /* define: {
        timestamps: false
    },
    pool: {
        max:5,
        min:0,
        acquire: 300000,
        idle: 10000
    },
    operatorAliases: false */
   /*  "dialectOptions": {
        "instanceName": "SQLEXPRESS"
    } */
});

export default sequelize;