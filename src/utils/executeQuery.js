import { getDbConnection } from '../config/database.js';

export const executeQuery = async (query, params = []) => {
    const pool = await getDbConnection();
    const request = pool.request();
    params.forEach((param) => request.input(param.name, param.value));
    return request.query(query);
};