import { executeQuery } from '../utils/executeQuery.js';
import { publishFanSettings } from '../mqttHandlers/fanHandler.js';
import { publishTemperatureSettings } from '../mqttHandlers/temperatureHandlers.js';
import client from '../config/mqtt.js';

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
export const getLatestTemperature = async (req, res) => {
    try {
        const temperatureDataQuery = `SELECT TOP 1 * FROM TemperatureData ORDER BY TemperatureTimestamp DESC`;
        const result = await executeQuery(temperatureDataQuery);
        if (result.recordset.length === 0)
            return res.status(404).json({ success: false, message: 'No temperature data found' });
        res.status(200).json({ success: true, data: result.recordset[0] });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// POST /temperature
export const addTemperatureData = async (req, res) => {
    try {
        const { Temperature, DeviceID } = req.body;

        if (!Temperature)
            return res.status(400).json({ success: false, message: 'Temperature is required.' });

        await executeQuery(`
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

        if (existing.recordset.length === 0)
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

// ---- TEMPERATURE DEVICES ----------------------------------------------------------------------------------------------------

// GET /temperature/device/:userId
export const getTemperatureDevices = async (req, res) => {
    const { userId } = req.params;
    try {
        const tdQuery = `SELECT * FROM TemperatureSensors WHERE UserID = @UserID`;
        const result = await executeQuery(tdQuery, [{ name: 'UserID', value: userId }]);
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// GET /temperature/device/:id
export const getTemperatureDeviceByID = async (req, res) => {
    const { id } = req.params;
    try {
        const locationQuery = `SELECT * FROM TemperatureSensors WHERE ID = @ID`;
        const result = await executeQuery(locationQuery, [{ name: 'ID', value: id }]);
        if (result.recordset.length === 0)
            return res.status(404).json({ success: false, message: 'Temperature sensor not found' });
        res.status(200).json({ success: true, data: result.recordset[0] });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// POST /temperature/device
export const addTemperatureDevice = async (req, res) => {
    try {
        const { Active, LocationID, UserID } = req.body;

        await executeQuery(`
                INSERT INTO TemperatureSensors (Active, DateAdded, LocationID, UserID)
                VALUES (@Active, GETDATE(), @LocationID, @UserID);
            `,
            [
                { name: 'Active', value: Active },
                { name: 'LocationID', value: LocationID },
                { name: 'UserID', value: UserID }
            ]
        );

        res.status(201).json({ success: true, message: 'New temperature device registered successfully!' });
    } catch (error) {
        console.error('Add new temperature device error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to register new temperature device.' });
    }
};

// PUT /temperature/device/:id
export const updateTemperatureDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const { Active, LocationID, UserID } = req.body;

        if (Active === undefined || !LocationID || !UserID)
            return res.status(400).json({ message: 'Active, LocationID, and UserID are required.' });

        const result = await executeQuery(`
                SELECT 
                    (SELECT COUNT(*) FROM TemperatureSensors WHERE ID = @ID) AS DeviceExists,
                    (SELECT COUNT(*) FROM Locations WHERE ID = @LocationID) AS LocationExists,
                    (SELECT COUNT(*) FROM Users WHERE ID = @UserID) AS UserExists
            `,
            [
                { name: 'ID', value: id },
                { name: 'LocationID', value: LocationID },
                { name: 'UserID', value: UserID }
            ]
        );

        const record = result.recordset[0];

        if (!record.DeviceExists)
            return res.status(404).json({ message: "Temperature device doesn't exist." });
        if (!record.LocationExists)
            return res.status(400).json({ message: 'Invalid LocationID — location not found.' });
        if (!record.UserExists)
            return res.status(400).json({ message: 'Invalid UserID — user not found.' });

        const currentData = await executeQuery(
            `SELECT Active, LocationID, UserID FROM TemperatureSensors WHERE ID = @ID;`,
            [{ name: 'ID', value: id }]
        );

        const current = currentData.recordset[0];
        if (current.Active === Active && current.LocationID === LocationID && current.UserID === UserID)
            return res.status(200).json({ message: 'Temperature device is already up to date.' });

        await executeQuery(`
                UPDATE TemperatureSensors
                SET 
                    Active = @Active,
                    LocationID = @LocationID,
                    UserID = @UserID
                WHERE ID = @ID;
            `,
            [
                { name: 'Active', value: Active },
                { name: 'LocationID', value: LocationID },
                { name: 'UserID', value: UserID },
                { name: 'ID', value: id }
            ]
        );

        res.status(200).json({ message: 'Temperature device updated successfully!' });
    } catch (error) {
        console.error('Update temperature device error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// DELETE /temperature/device/:id
export const deleteTemperatureDevice = async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await executeQuery(
            `SELECT ID FROM TemperatureSensors WHERE ID = @ID;`,
            [{ name: 'ID', value: id }]
        );

        if (existing.recordset.length === 0)
            return res.status(404).json({ success: false, message: 'Device not found' });

        await executeQuery(
            `DELETE FROM TemperatureSettings WHERE DeviceID = @ID;`,
            [{ name: 'ID', value: id }]
        );

        await executeQuery(
            `DELETE FROM TemperatureSensors WHERE ID = @ID;`,
            [{ name: 'ID', value: id }]
        );

        res.status(200).json({ message: 'The temperature device has been removed successfully!' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Failed to remove temperature device.' });
    }
};

// ---- TEMPERATURE DEVICE SETTINGS ----------------------------------------------------------------------------------------------------

// GET /temperature/device/setting
export const getTemperatureSettings = async (req, res) => {
    try {
        const tdQuery = `SELECT * FROM TemperatureSettings`;
        const result = await executeQuery(tdQuery);
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// GET /temperature/device/setting/:id
export const getTemperatureSettingByID = async (req, res) => {
    const { id } = req.params;
    try {
        const locationQuery = `SELECT * FROM TemperatureSettings WHERE ID = @ID`;
        const result = await executeQuery(locationQuery, [{ name: 'ID', value: id }]);
        if (result.recordset.length === 0)
            return res.status(404).json({ success: false, message: 'Temperature settings not found' });
        res.status(200).json({ success: true, data: result.recordset[0] });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// MQTT POST /temperature/device/setting
export const addTemperatureSetting = async (req, res) => {
    try {
        const { UserID, Location, DeviceID, MaxTemperature, NormalTemperature, MinTemperature } = req.body;

        if (!UserID || !Location || !DeviceID || MaxTemperature === null || NormalTemperature === null || MinTemperature === null) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: UserID, Location, DeviceID, MaxTemperature, NormalTemperature, or MinTemperature',
            });
        }

        const settings = { MaxTemperature, NormalTemperature, MinTemperature };

        await Promise.all([
            publishTemperatureSettings(client, UserID, Location, DeviceID, settings),
            executeQuery(`
                INSERT INTO TemperatureSettings (MaxTemperature, NormalTemperature, MinTemperature, DeviceID)
                VALUES (@MaxTemperature, @NormalTemperature, @MinTemperature, @DeviceID);
                `, [
                { name: 'MaxTemperature', value: MaxTemperature },
                { name: 'NormalTemperature', value: NormalTemperature },
                { name: 'MinTemperature', value: MinTemperature },
                { name: 'DeviceID', value: DeviceID }
            ])
        ]);

        res.status(200).json({ success: true, message: 'Temperature settings published successfully.' });
    } catch (error) {
        console.error('Error handling temperature settings:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error handling temperature settings',
        });
    }
};

// PUT /temperature/device/setting/:id
export const updateTemperatureSetting = async (req, res) => {
    try {
        const { id } = req.params;
        const { MaxTemperature, NormalTemperature, MinTemperature, DeviceID } = req.body;

        if (!id)
            return res.status(400).json({ success: false, message: 'Setting ID is required in the URL.' });
        if (MaxTemperature == null || NormalTemperature == null || MinTemperature == null || !DeviceID)
            return res.status(400).json({ success: false, message: 'Missing required fields in request body.' });

        const result = await executeQuery(`
                UPDATE TemperatureSettings
                SET 
                    MaxTemperature = @MaxTemperature,
                    NormalTemperature = @NormalTemperature,
                    MinTemperature = @MinTemperature,
                    DeviceID = @DeviceID
                WHERE ID = @ID;
            `,
            [
                { name: 'MaxTemperature', value: MaxTemperature },
                { name: 'NormalTemperature', value: NormalTemperature },
                { name: 'MinTemperature', value: MinTemperature },
                { name: 'DeviceID', value: DeviceID },
                { name: 'ID', value: id }
            ]
        );

        if (result.rowsAffected && result.rowsAffected[0] === 0)
            return res.status(404).json({ success: false, message: 'Temperature setting not found for the given SettingID.' });
        res.status(200).json({ success: true, message: 'Temperature setting updated successfully!' });
    } catch (error) {
        console.error('Update temperature device error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to update temperature setting.' });
    }
};

// DELETE /temperature/device/setting/:id
export const deleteTemperatureSetting = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id)
            return res.status(400).json({ success: false, message: 'Setting ID is required in the URL.' });

        await executeQuery(
            `UPDATE TemperatureSettings SET DeviceID = NULL WHERE ID = @ID;`,
            [{ name: 'ID', value: id }]
        );

        const result = await executeQuery(
            `DELETE FROM TemperatureSettings WHERE ID = @ID;`,
            [{ name: 'ID', value: id }]
        );

        if (result.rowsAffected && result.rowsAffected[0] === 0)
            return res.status(404).json({ success: false, message: 'Temperature setting not found for the given SettingID.' });

        res.status(200).json({ success: true, message: 'Temperature setting deleted successfully!' });
    } catch (error) {
        console.error('Delete temperature setting error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to delete temperature setting.' });
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

// MQTT POST /temperature/fan
export const postFanControl = async (req, res) => {
    try {
        const { Location, DeviceID, FanMode, UserID, FanOn, FanSpeed } = req.body;

        if (!Location || !DeviceID || !FanMode || !UserID) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: Location, DeviceID, or fanMode',
            });
        }

        if(FanMode.toLowerCase() !== "on" && FanMode.toLowerCase() !== "off" && FanMode.toLowerCase() !== "auto") {
            return res.status(400).json({
                success: false,
                message: 'fanMode can only be one of the following values: on, off or auto.',
            });
        }

        const settings = { fanMode: FanMode.toLowerCase() };
        await Promise.all([
            publishFanSettings(client, UserID, Location, DeviceID, settings),
            executeQuery(`
                INSERT INTO FanData (ActivationTimestamp, DeviceID, FanOn, FanSpeed, FanMode )
                VALUES (GETDATE(), @DeviceID, @FanOn, @FanSpeed, @FanMode);
                `,
                [
                    { name: 'DeviceID', value: DeviceID },
                    { name: 'FanOn', value: FanOn || null },
                    { name: 'FanSpeed', value: FanSpeed || null },
                    { name: 'FanMode', value: FanMode }
                ])
        ]);
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error handling fan control:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error handling fan control',
        });
    }
};

// ---- FAN SENSOR DEVICES ----------------------------------------------------------------------------------------------------

// GET /temperature/fan/device/:userId
export const getUsersFans = async (req, res) => {
    const { userId } = req.params;

    try {
        const fansQuery = `
            SELECT fs.*, COALESCE(fd.fanMode, 'off') AS fanMode
            FROM FanSensors fs
            LEFT JOIN FanData fd 
            ON fd.ID = (
                SELECT TOP 1 ID
                FROM FanData
                WHERE DeviceID = fs.ID
                ORDER BY ActivationTimestamp DESC
            )
            WHERE fs.UserID = @UserID;
        `;

        const result = await executeQuery(fansQuery, [
            { name: 'UserID', value: userId }
        ]);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No fan sensors found for this user'
            });
        }

        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

// POST /temperature/fan/device
export const addFanDevice = async (req, res) => {
    try {
        const { Active, LocationID, UserID } = req.body;

        await executeQuery(`
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
        const DeviceID = req.params.id;
        const { Active, LocationID, UserID, FanMode } = req.body;

        const fanResult = await executeQuery(
            `SELECT COUNT(*) AS FanExists FROM FanSensors WHERE ID = @DeviceID`,
            [{ name: 'DeviceID', value: DeviceID }]
        );

        if (!fanResult.recordset[0].FanExists)
            return res.status(404).json({ message: "Fan device doesn't exist." });

        if (UserID) {
            const userResult = await executeQuery(
                `SELECT COUNT(*) AS UserExists FROM Users WHERE ID = @UserID`,
                [{ name: 'UserID', value: UserID }]
            );

            if (!userResult.recordset[0].UserExists)
                return res.status(400).json({ message: 'User not found.' });
        }

        if (LocationID) {
            const locationResult = await executeQuery(
                `SELECT COUNT(*) AS LocationExists FROM Locations WHERE ID = @LocationID`,
                [{ name: 'LocationID', value: LocationID }]
            );
            if (!locationResult.recordset[0].LocationExists)
                return res.status(400).json({ message: 'Location not found.' });
        }

        const updates = [];
        const params = [{ name: 'DeviceID', value: DeviceID }];

        if (Active !== undefined)
            updates.push('Active = @Active'); params.push({ name: 'Active', value: Active });
        if (UserID)
            updates.push('UserID = @UserID'); params.push({ name: 'UserID', value: UserID });
        if (LocationID)
            updates.push('LocationID = @LocationID'); params.push({ name: 'LocationID', value: LocationID });
        if (updates.length > 0)
            await executeQuery(`UPDATE FanSensors SET ${updates.join(', ')} WHERE ID = @DeviceID`, params);

        if (FanMode) {
            await executeQuery(`
                INSERT INTO FanData (DeviceID, fanMode, ActivationTimestamp)
                VALUES (@DeviceID, @FanMode, GETDATE());
                `,
                [
                    { name: 'DeviceID', value: DeviceID },
                    { name: 'FanMode', value: FanMode }
                ]
            );

            const locationName = LocationID
                ? (await executeQuery(
                    `SELECT LocationName FROM Locations WHERE ID = @LocationID`,
                    [{ name: 'LocationID', value: LocationID }]
                ))?.recordset[0]?.LocationName || '' : '';

            const settings = { fanMode: FanMode.toLowerCase() };
            await publishFanSettings(client, UserID, locationName.toLowerCase(), DeviceID, settings);
        }

        res.status(200).json({ message: 'Fan device updated successfully!' });
    } catch (error) {
        console.error('Update fan device error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// DELETE /temperature/fan/device/:id
export const deleteFan = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await executeQuery(`SELECT ID FROM FanSensors WHERE ID = @ID;`, [{ name: 'ID', value: id }]);
        if (existing.recordset.length === 0)
            return res.status(404).json({ message: "This fan device doesn't exist." });
        await executeQuery(`DELETE FROM FanData WHERE DeviceID = @DeviceID;`, [{ name: 'DeviceID', value: id }]);
        await executeQuery(`DELETE FROM FanSensors WHERE ID = @ID;`, [{ name: 'ID', value: id }]);
        res.status(200).json({ message: 'Fan device and related data removed successfully!' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Failed to remove fan device.' });
    }
};