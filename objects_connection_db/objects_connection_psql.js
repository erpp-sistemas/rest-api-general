import { Sequelize } from "sequelize";
import {} from "dotenv/config";


const coneccion_db_psql = info => ({
    connection_postgresql() {
        const connection = new Sequelize(info.nombre_db, process.env.POSTGRESQL_USER, process.env.POSTGRESQL_PASSWORD, {
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
    }
});


export const Psql_db_cuautitlan_izcalli = data => {
    const { nombre_db } = data;

    let info = {
        nombre_db
    };

    return Object.assign(
        coneccion_db_psql(info)
    )
}

// export const psql_db_naucalpan = da 
// export const psql_db_zinacantepec = 