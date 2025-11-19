import { executeQuery } from '../utils/executeQuery.js';

// GET /locations
export const getLocations = async (req, res) => {
    try {
        const locationsQuery = `SELECT * FROM Locations`;
        const result = await executeQuery(locationsQuery);
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// GET /locations/:id
export const getLocationsByID = async (req, res) => {
    const { id } = req.params;
    try {
        const locationQuery = `SELECT * FROM Locations WHERE ID = @ID`;
        const result = await executeQuery(locationQuery, [{ name: 'ID', value: id }]);
        if (result.recordset.length === 0) {
            const msg = getMessage(messages.error.notFound, { entity: "Location" });
            return res.status(404).json({ success: false, message: msg });
        }
        res.status(200).json({ success: true, data: result.recordset[0] });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// POST /locations
export const addLocation = async (req, res) => {
    try {
        const { LocationName } = req.body;

        if (!LocationName || LocationName.trim() === '')
            return res.status(400).json({ message: 'LocationName is required.' });

        const existing = await executeQuery(
            `SELECT ID FROM Locations WHERE LOWER(LocationName) = LOWER(@LocationName);`,
            [{ name: 'LocationName', value: LocationName.trim() }]
        );

        if (Array.isArray(existing.recordset) && existing.recordset.length > 0)
            return res.status(409).json({ message: 'Location already exists.' });

        await executeQuery(
            `INSERT INTO Locations (LocationName) VALUES (@LocationName);`,
            [{ name: 'LocationName', value: LocationName.trim() }]
        );

        res.status(201).json({ message: 'Location added successfully!' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Failed to add location.' });
    }
};

// PUT /locations/:id
export const updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { LocationName } = req.body;

        if (!LocationName)
            return res.status(400).json({ message: 'LocationName is required.' });

        const result = await executeQuery(
            `
            SELECT
                (SELECT LocationName FROM Locations WHERE ID = @ID) AS CurrentName,
                (SELECT COUNT(*) FROM Locations WHERE LocationName = @LocationName AND ID != @ID) AS DuplicateCount
            `,
            [
                { name: 'ID', value: id },
                { name: 'LocationName', value: LocationName }
            ]
        );

        const record = result.recordset[0];

        if (!record.CurrentName)
            return res.status(404).json({ message: "Location doesn't exist." });
        if (record.CurrentName === LocationName)
            return res.status(200).json({ message: 'Location name is already up to date.' });
        if (record.DuplicateCount > 0)
            return res.status(409).json({ message: 'This location exists already.' });

        await executeQuery(
            `UPDATE Locations SET LocationName = @LocationName WHERE ID = @ID;`,
            [
                { name: 'LocationName', value: LocationName },
                { name: 'ID', value: id }
            ]
        );

        res.status(200).json({ message: 'Location updated successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// DELETE /locations/:id
export const deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await executeQuery(
            `SELECT ID FROM Locations WHERE ID = @ID;`,
            [{ name: 'ID', value: id }]
        );

        if (existing.length === 0)
            return res.status(404).json({ message: 'Location not found.' });

        await executeQuery(
            `DELETE FROM Locations WHERE ID = @ID;`,
            [{ name: 'ID', value: id }]
        );

        res.status(200).json({ message: 'Location deleted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Failed to delete location.' });
    }
};