/**
 * ========================================= Aquí se especifican todos los queries ==================================
 *                                                                                                  que tienen una estructura básica, como un
 *                                                                                                  simple select all, delete all, etc.
 * ====================================================================================================
*/
export const get_all_records = async data => {
    try {
        const { connection_db, table_name } = data;

        const [records, metadata] =  await connection_db.query(`
            SELECT * FROM "${table_name}"
        `);

        return records;
    } catch (error) {
        console.log(error);
    }
}