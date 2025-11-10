import { executeQuery } from '../utils/executeQuery.js';
import { createAccessLog } from '../utils/createAccessLog.js';

// ---- KEYCARDS ----------------------------------------------------------------------------------------------------

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
        if (result.recordset.length === 0)
            return res.status(404).json({ success: false, message: 'Keycard not found' });
        res.status(200).json({ success: true, data: result.recordset[0] });
    } catch (error) {
        console.error('Error fetching unit by ID:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// GET /keycards/name/:id
export const getKeycardOwners = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT u.FirstName, u.LastName 
            FROM Users u
            INNER JOIN Keycards k ON k.UserID = u.ID
            WHERE k.ID = @id
        `;

        const result = await executeQuery(query, [{ name: 'id', type: 'Int', value: id }]);
        if (result.recordset.length === 0)
            return res.status(404).json({ success: false, message: 'No owners found for this keycard' });
        const ownersString = result.recordset.map(owner => `${owner.FirstName} ${owner.LastName}`).join(', ');
        res.status(200).json({ success: true, owners: ownersString });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// POST /keycards
export const addKeycard = async (req, res) => {
    try {
        const { RfidTag, Name, ExpirationDate, UserID, StatusTypeID } = req.body;

        if (!RfidTag)
            return res.status(400).json({ success: false, message: 'Please provide an RfidTag.' });

        const existing = await executeQuery(
            `SELECT ID FROM Keycards WHERE RfidTag = @RfidTag;`,
            [{ name: 'RfidTag', value: RfidTag.trim() }]
        );

        if (existing.recordset.length > 0)
            return res.status(409).json({ success: false, message: 'A keycard with this RfidTag already exists.' });

        const insertQuery = `
            INSERT INTO Keycards (RfidTag, Name, ExpirationDate, UserID, StatusTypeID, IssueDate)
            VALUES (@RfidTag, @Name, @ExpirationDate, @UserID, @StatusTypeID, GETDATE());
        `;

        await executeQuery(insertQuery, [
            { name: 'RfidTag', value: RfidTag.trim() },
            { name: 'Name', value: Name.trim() },
            { name: 'ExpirationDate', value: ExpirationDate || null },
            { name: 'UserID', value: UserID || null },
            { name: 'StatusTypeID', value: StatusTypeID || null }
        ]);

        res.status(201).json({ success: true, message: 'Keycard added successfully!' });
    } catch (error) {
        console.error('Add keycard error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to add keycard.' });
    }
};

// PUT /keycards/:id
export const updateKeycard = async (req, res) => {
    try {
        const { id } = req.params;
        const { RfidTag, Name, ExpirationDate, UserID, StatusTypeID } = req.body;

        const keycard = await executeQuery(
            `SELECT * FROM Keycards WHERE ID = @ID;`,
            [{ name: 'ID', value: id }]
        );

        if (!keycard.recordset.length)
            return res.status(404).json({ success: false, message: 'Keycard not found.' });

        if (RfidTag) {
            const existing = await executeQuery(
                `SELECT ID FROM Keycards WHERE RfidTag = @RfidTag AND ID != @ID;`,
                [
                    { name: 'RfidTag', value: RfidTag.trim() },
                    { name: 'ID', value: id }
                ]
            );

            if (existing.recordset.length > 0)
                return res.status(409).json({ success: false, message: 'Another keycard with this RfidTag already exists.' });
        }

        const fields = [];
        const params = [{ name: 'ID', value: id }];

        if (RfidTag)
            fields.push('RfidTag = @RfidTag'); params.push({ name: 'RfidTag', value: RfidTag.trim() });
        if (RfidTag)
            fields.push('Name = @Name'); params.push({ name: 'Name', value: Name.trim() });
        if (ExpirationDate)
            fields.push('ExpirationDate = @ExpirationDate'); params.push({ name: 'ExpirationDate', value: ExpirationDate });
        if (UserID)
            fields.push('UserID = @UserID'); params.push({ name: 'UserID', value: UserID });
        if (StatusTypeID)
            fields.push('StatusTypeID = @StatusTypeID'); params.push({ name: 'StatusTypeID', value: StatusTypeID });
        if (fields.length === 0)
            return res.status(400).json({ success: false, message: 'No valid fields provided for update.' });

        const updateQuery = `UPDATE Keycards SET ${fields.join(', ')} WHERE ID = @ID;`;
        await executeQuery(updateQuery, params);
        res.status(200).json({ success: true, message: 'Keycard updated successfully!' });
    } catch (error) {
        console.error('Update keycard error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to update keycard.' });
    }
};

// DELETE /keycards/status/:id
export const deleteKeycard = async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await executeQuery(
            `SELECT ID FROM Keycards WHERE ID = @ID;`,
            [{ name: 'ID', value: id }]
        );

        if (existing.length === 0)
            return res.status(404).json({ message: 'Keycard not found.' });

        await executeQuery(
            `DELETE FROM Keycards WHERE ID = @ID;`,
            [{ name: 'ID', value: id }]
        );

        res.status(200).json({ message: 'Keycard deleted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Failed to delete keycard.' });
    }
};

// ---- KEYCARD ACCESS LOGS ----------------------------------------------------------------------------------------------------

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

// GET /keycards/logs/:id
export const getAKeycardsAccessLogs = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT a.* FROM AccessLog a
            JOIN Keycards k ON a.RfidTag = k.RfidTag
            WHERE k.ID = @id
            ORDER BY a.AccessTime DESC
        `;

        const result = await executeQuery(query, [{ name: 'id', value: id }]);
        if (result.recordset.length === 0)
            return res.status(404).json({ success: false, message: 'No access logs found for this keycard' });
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || error 
        });
    }
};

// POST /keycards/logs
export const addAccessLog = async (req, res) => {
    try {
        const { KeycardID, LocationID } = req.body;
        await createAccessLog({ KeycardID, LocationID });
        res.status(201).json({ success: true, message: 'Access log record added successfully!' });
    } catch (error) {
        console.error('Error adding access log:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to add access log record.' });
    }
};

// ---- KEYCARD SATUSES ----------------------------------------------------------------------------------------------------

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
            SET StatusName = @StatusName, StatusDescription = @StatusDescription
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

export const updateSmartLockState = async (req, res) => {
    try {
        const { UserID, Location, DeviceID, isLocked } = req.body;

        if (!UserID || !Location || !DeviceID || isLocked === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: UserID, Location, DeviceID, or isLocked',
            });
        }

        await publishRfidLockState(client, UserID, Location, DeviceID, isLocked);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error handling rfid lock settings:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error handling rfid lock settings',
        });
    }
}