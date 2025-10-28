import { executeQuery } from '../utils/executeQuery.js';

// GET /units
export const getUnits = async (req, res) => {
    try {
        const unitsQuery = `
            SELECT u.*, l.LocationName, st.SensorTypeName
            FROM Unit u
            LEFT JOIN Locations l ON u.LocationID = l.ID
            LEFT JOIN SensorType st ON u.SensorTypeID = st.ID
        `;

        const result = await executeQuery(unitsQuery);
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// GET /units/:id
export const getUnitById = async (req, res) => {
    const { id } = req.params;

    try {
        const unitQuery = `
            SELECT u.*, l.LocationName, st.SensorTypeName
            FROM Unit u
            LEFT JOIN Locations l ON u.LocationID = l.ID
            LEFT JOIN SensorType st ON u.SensorTypeID = st.ID
            WHERE u.ID = @ID
        `;

        const result = await executeQuery(unitQuery, [{ name: 'ID', value: id }]);
        if (result.recordset.length === 0) { return res.status(404).json({ success: false, message: 'Unit not found' }); }
        res.status(200).json({ success: true, data: result.recordset[0] });
    } catch (error) {
        console.error('Error fetching unit by ID:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// POST /units
export const addUnit = async (req, res) => {
    try {
        const { Active, SensorTypeID, LocationID, UserID } = req.body;

        await executeQuery(
            `
            INSERT INTO Unit (Active, DateAdded, SensorTypeID, LocationID, UserID) 
            VALUES (@Active, GETDATE(), @SensorTypeID, @LocationID, @UserID)
            `,
            [
                { name: 'Active', value: Active || 1 },
                { name: 'SensorTypeID', value: SensorTypeID },
                { name: 'LocationID', value: LocationID },
                { name: 'UserID', value: UserID || "" },
            ]
        );

        res.status(201).json("Unit added successfully!");
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: 'Failed to add unit.' });
    }
};

// PUT /units/:id
export const updateUnit = async (req, res) => {
    try {
        const { id } = req.params;
        const { Active, SensorTypeID, LocationID, UserID } = req.body;

        await executeQuery(
            `
            UPDATE Unit
            SET 
                Active = @Active,
                SensorTypeID = @SensorTypeID,
                LocationID = @LocationID,
                UserID = @UserID
            WHERE ID = @ID
            `,
            [
                { name: 'Active', value: Active },
                { name: 'SensorTypeID', value: SensorTypeID },
                { name: 'LocationID', value: LocationID },
                { name: 'UserID', value: UserID || "" },
                { name: 'ID', value: id }
            ]
        );

        res.status(200).json("Unit updated successfully!");
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: 'Failed to update unit.' });
    }
};

// DELETE /units/:id
export const deleteUnit = async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await executeQuery(
            `SELECT ID FROM Unit WHERE ID = @ID;`,
            [{ name: 'ID', value: id }]
        );

        if (existing.length === 0)
            return res.status(404).json({ message: 'Unit not found.' });

        await executeQuery(
            `DELETE FROM Unit WHERE ID = @ID;`,
            [{ name: 'ID', value: id }]
        );

        res.status(200).json({ message: 'Unit deleted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Failed to delete unit.' });
    }
};