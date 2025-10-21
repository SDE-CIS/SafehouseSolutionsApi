import { executeQuery } from '../utils/executeQuery.js';

// GET /temperature
export const getTemperatures = async (req, res) => {
    try {
        const temperatureQuery = `SELECT * FROM TemperatureSensor`;
        const result = await executeQuery(temperatureQuery);
        res.status(200).json({ success: true,data: result.recordset });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// GET /temperature/fan
export const getFanActivity = async (req, res) => {
    try {
        const fanQuery = `
            SELECT fs.*, ts.Temperature
            FROM FanSensor fs
            LEFT JOIN TemperatureSensor ts ON fs.UnitID = ts.UnitID
        `;
        
        const result = await executeQuery(fanQuery);
        res.status(200).json({success: true,data: result.recordset,});
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};