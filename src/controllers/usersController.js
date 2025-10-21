import { executeQuery } from '../utils/executeQuery.js';

// GET /users
export const getUsers = async (req, res) => {
    try {
        const usersQuery = `SELECT * FROM Users`;
        const result = await executeQuery(usersQuery);
        res.status(200).json({ success: true, data: result.recordset});
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// GET /users/:id
export const getUsersByID = async (req, res) => {
    const { id } = req.params;
    try {
        const userQuery = `SELECT * FROM Users WHERE ID = @ID`;
        const result = await executeQuery(userQuery, [{ name: 'ID', value: id }]);
        if (result.recordset.length === 0) { return res.status(404).json({ success: false, message: 'Unit not found' }); }
        res.status(200).json({ success: true, data: result.recordset[0] });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};