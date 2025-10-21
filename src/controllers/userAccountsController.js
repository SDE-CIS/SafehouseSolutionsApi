import { executeQuery } from '../utils/executeQuery.js';

// GET /units
export const getUserAccounts = async (req, res) => {
    try {
        const unitsQuery = `SELECT * FROM UserAccounts`;
        const result = await executeQuery(unitsQuery);
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};