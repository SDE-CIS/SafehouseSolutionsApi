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

// ---- KEYCARD SATUSES

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

// POST /keycards/status
export const addKeycardStatus = async (req, res) => {
    try {
        const { StatusName, StatusDescription } = req.body;

        if (!StatusName || !StatusDescription)
            return res.status(400).json({ message: 'Please provide both StatusName and StatusDescription.' });

        const existing = await executeQuery(
            `SELECT ID FROM StatusTypes WHERE LOWER(StatusName) = LOWER(@StatusName);`,
            [{ name: 'StatusName', value: StatusName.trim() }]
        );

        if (Array.isArray(existing.recordset) && existing.recordset.length > 0)
            return res.status(409).json({ message: 'This keycard status already exists.' });

        await executeQuery(
            `INSERT INTO StatusTypes (StatusName, StatusDescription) VALUES (@StatusName, StatusDescription);`,
            [
                { name: 'StatusName', value: StatusName.trim() },
                { name: 'StatusDescription', value: StatusDescription.trim() }
            ]
        );

        res.status(201).json({ message: 'Keycard status added successfully!' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Failed to add keycard status.' });
    }
};

// PUT /keycards/status/:id
export const updateKeycardStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { StatusName, StatusDescription } = req.body;

        if (!StatusName || !StatusDescription)
            return res.status(400).json({ message: 'Please provide both StatusName and StatusDescription.' });

        const result = await executeQuery(
            `
            SELECT
                (SELECT StatusName FROM StatusTypes WHERE ID = @ID) AS CurrentName,
                (SELECT COUNT(*) FROM StatusTypes WHERE LOWER(StatusName) = LOWER(@StatusName) AND ID != @ID) AS DuplicateCount
            `,
            [
                { name: 'ID', value: id },
                { name: 'StatusName', value: StatusName.trim() }
            ]
        );

        const record = result.recordset[0];

        if (!record.CurrentName)
            return res.status(404).json({ message: "This keycard status already exists." });

        if (record.CurrentName.toLowerCase() === StatusName.trim().toLowerCase())
            return res.status(200).json({ message: 'Keycard status name is already up to date.' });

        if (record.DuplicateCount > 0)
            return res.status(409).json({ message: 'This keycard status name already exists.' });

        await executeQuery(
            `
            UPDATE StatusTypes
            SET StatusName = @StatusName,
                StatusDescription = @StatusDescription
            WHERE ID = @ID;
            `,
            [
                { name: 'StatusName', value: StatusName.trim() },
                { name: 'StatusDescription', value: StatusDescription.trim() },
                { name: 'ID', value: id }
            ]
        );

        res.status(200).json({ message: 'Keycard status updated successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Failed to update keycard status.' });
    }
};

// DELETE /keycards/status/:id
export const deleteKeycardStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await executeQuery(
            `SELECT ID FROM StatusTypes WHERE ID = @ID;`,
            [{ name: 'ID', value: id }]
        );

        if (existing.length === 0)
            return res.status(404).json({ message: 'Keycard status not found.' });

        await executeQuery(
            `DELETE FROM StatusTypes WHERE ID = @ID;`,
            [{ name: 'ID', value: id }]
        );

        res.status(200).json({ message: 'Keycard status deleted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Failed to delete keycard status.' });
    }
};
