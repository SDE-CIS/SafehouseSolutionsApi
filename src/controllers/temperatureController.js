import { executeQuery } from '../utils/executeQuery.js';

// ---- TEMPERATURE SENSOR DATA ----------------------------------------------------------------------------------------------------

// GET /temperature
export const getTemperatureData = async (req, res) => {
    try {
        const temperatureDataQuery = `SELECT * FROM TemperatureData`;
        const result = await executeQuery(temperatureDataQuery);
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// GET /temperature/latest
// ...

// POST /temperature
export const addTemperatureData = async (req, res) => {
    try {
        const { Temperature, DeviceID } = req.body;

        if (!Temperature)
            return res.status(400).json({ success: false, message: 'Temperature is required.' });

        await executeQuery(
            `
            INSERT INTO TemperatureData (Temperature, MeasurementTimestamp, DeviceID)
            VALUES (@Temperature, GETDATE(), @DeviceID);
            `,
            [
                { name: 'Temperature', value: Temperature },
                { name: 'DeviceID', value: DeviceID || null }
            ]
        );

        res.status(201).json({ success: true, message: 'Temperature record added successfully!' });
    } catch (error) {
        console.error('Add temperature error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to add temperature record.' });
    }
};

// DELETE /temperature/:id
export const deleteTemperatureData = async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await executeQuery(
            `SELECT ID FROM TemperatureData WHERE ID = @ID;`,
            [{ name: 'ID', value: id }]
        );

        if (existing.length === 0)
            return res.status(404).json({ message: 'Temperature data not found.' });

        await executeQuery(
            `DELETE FROM TemperatureData WHERE ID = @ID;`,
            [{ name: 'ID', value: id }]
        );

        res.status(200).json({ message: 'Temperature data deleted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Failed to delete temperature data.' });
    }
};

// ---- TEMPERATURE DEVICE SETTINGS ----------------------------------------------------------------------------------------------------

// GET /temperature/device
export const getTemperatureDevices = async (req, res) => {
    try {
        const tdQuery = `SELECT * FROM TemperatureSensors`;
        const result = await executeQuery(tdQuery);
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// GET /temperature/device/:id
export const getTemperatureDeviceByID = async (req, res) => {
    try {
        const tdQuery = `SELECT * FROM TemperatureSensors`;
        const result = await executeQuery(tdQuery);
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// ---- FAN SENSOR DATA ----------------------------------------------------------------------------------------------------

// GET /temperature/fan
export const getFanData = async (req, res) => {
    try {
        const fanQuery = `SELECT * FROM FanData`;
        const result = await executeQuery(fanQuery);
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// POST /temperature/fan
export const addFanActivity = async (req, res) => {
    try {
        const { Activation, DeviceID } = req.body;

        await executeQuery(
            `
            INSERT INTO FanData (Activation, ActivationTimestamp, DeviceID)
            VALUES (@Activation, GETDATE(), @DeviceID);
            `,
            [
                { name: 'Activation', value: Activation || null },
                { name: 'DeviceID', value: DeviceID || null }
            ]
        );

        res.status(201).json({ success: true, message: 'Fan activity record added successfully!' });
    } catch (error) {
        console.error('Add fan activity error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to add fan activity record.' });
    }
};

// ---- FAN SENSOR DEVICES ----------------------------------------------------------------------------------------------------

// GET /temperature/fan/device
export const getFans = async (req, res) => {
    try {
        const fanQuery = `SELECT * FROM FanSensors`;
        const result = await executeQuery(fanQuery);
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// GET /temperature/fan/device/:id
export const getFanByID = async (req, res) => {
    const { id } = req.params;
    try {
        const locationQuery = `SELECT * FROM FanSensors WHERE ID = @ID`;
        const result = await executeQuery(locationQuery, [{ name: 'ID', value: id }]);
        if (result.recordset.length === 0)
            return res.status(404).json({ success: false, message: 'Fan sensor not found' }); 
        res.status(200).json({ success: true, data: result.recordset[0] });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// POST /temperature/fan/device
export const addFan = async (req, res) => {
    try {
        const { Active, LocationID, UserID } = req.body;

        await executeQuery(
            `
            INSERT INTO FanSensors (Active, DateAdded, LocationID, UserID)
            VALUES (@Active, GETDATE(), @LocationID, @UserID);
            `,
            [
                { name: 'Active', value: Active },
                { name: 'LocationID', value: LocationID },
                { name: 'UserID', value: UserID }
            ]
        );

        res.status(201).json({ success: true, message: 'New fan device registered successfully!' });
    } catch (error) {
        console.error('Add fan activity error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to register new fan device.' });
    }
};

// PUT /temperature/fan/device/:id
export const updateFan = async (req, res) => {
    try {
        const { id } = req.params;
        const { Active, LocationID, UserID } = req.body;

        await executeQuery(
            `
            UPDATE FanSensors
            SET 
                Active = @Active,
                LocationID = @LocationID,
                UserID = @UserID
            WHERE ID = @ID;
            `,
            [
                { name: 'ID', value: id },
                { name: 'Active', value: Active },
                { name: 'LocationID', value: LocationID },
                { name: 'UserID', value: UserID }
            ]
        );

        res.status(200).json({ success: true, message: 'Fan device updated successfully!' });
    } catch (error) {
        console.error('Update fan activity error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to update fan device.' });
    }
};

// DELETE /temperature/fan/device/:id
export const deleteFan = async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await executeQuery(
            `SELECT ID FROM FanSensors WHERE ID = @ID;`,
            [{ name: 'ID', value: id }]
        );

        if (existing.length === 0)
            return res.status(404).json({ message: "This fan device doesn't exist." });

        await executeQuery(
            `DELETE FROM FanData WHERE DeviceID = @DeviceID;`,
            [{ name: 'DeviceID', value: id }]
        );

        await executeQuery(
            `DELETE FROM FanSensors WHERE ID = @ID;`,
            [{ name: 'ID', value: id }]
        );

        res.status(200).json({ message: 'Fan device and related data removed successfully!' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Failed to remove fan device.' });
    }
};
