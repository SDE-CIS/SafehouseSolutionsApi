import { executeQuery } from '../utils/executeQuery.js';

// ---- TEMPERATURE SENSOR ACTIVITY ----------------------------------------------------------------------------------------------------

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

// POST /temperature
export const addTemperature = async (req, res) => {
    try {
        const { Temperature, UnitID } = req.body;

        if (Temperature === undefined || Temperature === null)
            return res.status(400).json({ success: false, message: 'Temperature is required.' });

        await executeQuery(
            `
            INSERT INTO Temperatures (Temperature, MeasurementTimestamp, UnitID)
            VALUES (@Temperature, GETDATE(), @UnitID);
            `,
            [
                { name: 'Temperature', value: Temperature },
                { name: 'UnitID', value: UnitID || null }
            ]
        );

        res.status(201).json({ success: true, message: 'Temperature record added successfully!' });
    } catch (error) {
        console.error('Add temperature error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to add temperature record.' });
    }
};

// ---- FAN SENSOR ACTIVITY ----------------------------------------------------------------------------------------------------

// GET /temperature/fan
export const getFanActivity = async (req, res) => {
    try {
        const fanQuery = `
            SELECT fs.*, ts.Temperature
            FROM FanSensor fs
            LEFT JOIN TemperatureSensor ts ON fs.UnitID = ts.UnitID
        `;
        
        const result = await executeQuery(fanQuery);
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};