import { executeQuery } from '../utils/executeQuery.js';

// GET /sensor/type
export const getSensorTypes = async (req, res) => {
    try {
        const sensorTypesQuery = `SELECT * FROM SensorTypes`;
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
        const sensorType = `SELECT * FROM SensorTypes WHERE ID = @ID`;
        const result = await executeQuery(sensorType, [{ name: 'ID', value: id }]);
        if (result.recordset.length === 0) { return res.status(404).json({ success: false, message: 'Unit not found' }); }
        res.status(200).json({ success: true, data: result.recordset[0] });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};