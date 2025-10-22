import { executeQuery } from '../utils/executeQuery.js';

// GET /keycards
export const getKeycards = async (req, res) => {
    try {
        const keycardsQuery = `
            SELECT k.*, st.StatusName, st.StatusDescription
            FROM Keycards k
            LEFT JOIN StatusTypes st ON k.StatusTypeID = st.ID
        `;

        const result = await executeQuery(keycardsQuery);
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// GET /keycards/:id
export const getKeycardById = async (req, res) => {
    const { id } = req.params;

    try {
        const keycardQuery = `
            SELECT k.*, st.StatusName, st.StatusDescription
            FROM Keycards k
            LEFT JOIN StatusTypes st ON k.StatusTypeID = st.ID
            WHERE k.ID = @ID
        `;

        const result = await executeQuery(keycardQuery, [{ name: 'ID', value: id }]);
        if (result.recordset.length === 0) { return res.status(404).json({ success: false, message: 'Unit not found' }); }
        res.status(200).json({ success: true, data: result.recordset[0] });
    } catch (error) {
        console.error('Error fetching unit by ID:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// GET /keycards/logs
export const getAccessLogs = async (req, res) => {
    try {
        const logsQuery = `SELECT * FROM AccessLog`;
        const result = await executeQuery(logsQuery);
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// GET /keycards/status
export const getKeycardsStatuses = async (req, res) => {
    try {
        const keycardStatusesQuery = `SELECT * FROM StatusTypes`;
        const result = await executeQuery(keycardStatusesQuery);
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// GET /keycards/status/:id
export const getKeycardsStatusesByID = async (req, res) => {
    const { id } = req.params;
    try {
        const keycardStatusQuery = `SELECT * FROM StatusTypes WHERE ID = @ID`;
        const result = await executeQuery(keycardStatusQuery, [{ name: 'ID', value: id }]);
        if (result.recordset.length === 0) { return res.status(404).json({ success: false, message: 'Status type not found.' }); }
        res.status(200).json({ success: true, data: result.recordset[0] });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};