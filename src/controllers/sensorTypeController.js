import { executeQuery } from '../utils/executeQuery.js';

// GET /sensor/type
export const getSensorTypes = async (req, res) => {
    try {
        const sensorTypesQuery = `SELECT * FROM SensorType`;
        const result = await executeQuery(sensorTypesQuery);
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// GET /sensor/type/:id
export const getSensorTypesByID = async (req, res) => {
    const { id } = req.params;
    try {
        const sensorTypeQuery = `SELECT * FROM SensorType WHERE ID = @ID`;
        const result = await executeQuery(sensorTypeQuery, [{ name: 'ID', value: id }]);
        if (result.recordset.length === 0) { return res.status(404).json({ success: false, message: 'Unit not found' }); }
        res.status(200).json({ success: true, data: result.recordset[0] });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// POST /sensor/type
export const addSensorType = async (req, res) => {
    try {
        const { SensorTypeName } = req.body;

        if (!SensorTypeName || SensorTypeName.trim() === '')
            return res.status(400).json({ message: 'SensorTypeName is required.' });

        const existing = await executeQuery(
            `SELECT ID FROM SensorType WHERE LOWER(SensorTypeName) = LOWER(@SensorTypeName);`,
            [{ name: 'SensorTypeName', value: SensorTypeName.trim() }]
        );

        if (Array.isArray(existing.recordset) && existing.recordset.length > 0)
            return res.status(409).json({ message: 'This sensor type already exists.' });

        await executeQuery(
            `INSERT INTO SensorType (SensorTypeName) VALUES (@SensorTypeName);`,
            [{ name: 'SensorTypeName', value: SensorTypeName.trim() }]
        );

        res.status(201).json({ message: 'Sensor type added successfully!' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Failed to add sensor type.' });
    }
};

// PUT /sensor/type/:id
export const updateSensorType = async (req, res) => {
    try {
        const { id } = req.params;
        const { SensorTypeName } = req.body;

        if (!SensorTypeName)
            return res.status(400).json({ message: 'SensorTypeName is required.' });

        const result = await executeQuery(
            `
            SELECT
                (SELECT SensorTypeName FROM SensorType WHERE ID = @ID) AS CurrentName,
                (SELECT COUNT(*) FROM SensorType WHERE SensorTypeName = @SensorTypeName AND ID != @ID) AS DuplicateCount
            `,
            [
                { name: 'ID', value: id },
                { name: 'SensorTypeName', value: SensorTypeName }
            ]
        );

        const record = result.recordset[0];

        if (!record.CurrentName)
            return res.status(404).json({ message: "Sensor type doesn't exist." });

        if (record.CurrentName === SensorTypeName)
            return res.status(200).json({ message: 'Sensor type name is already up to date.' });

        if (record.DuplicateCount > 0)
            return res.status(409).json({ message: 'This sensor type already exists.' });

        await executeQuery(
            `UPDATE SensorType SET SensorTypeName = @SensorTypeName WHERE ID = @ID;`,
            [
                { name: 'SensorTypeName', value: SensorTypeName },
                { name: 'ID', value: id }
            ]
        );

        res.status(200).json({ message: 'Sensor type updated successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// DELETE /sensor/type/:id
export const deleteSensorType = async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await executeQuery(
            `SELECT ID FROM SensorType WHERE ID = @ID;`,
            [{ name: 'ID', value: id }]
        );

        if (existing.recordset.length === 0)
            return res.status(404).json({ message: 'Sensor type not found.' });

        await executeQuery(
            `DELETE FROM SensorType WHERE ID = @ID;`,
            [{ name: 'ID', value: id }]
        );

        res.status(200).json({ message: 'Sensor type deleted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Failed to delete sensor type.' });
    }
};