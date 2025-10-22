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

        await executeQuery(
            `
            INSERT INTO SensorType (SensorTypeName) 
            VALUES (@SensorTypeName);
            `,
            [{ name: 'SensorTypeName', value: SensorTypeName }]
        );

        res.status(201).json({ message: 'Sensor type added successfully!' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Failed to add sensor type.' });
    }
};