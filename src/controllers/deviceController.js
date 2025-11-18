import { executeQuery } from "../utils/executeQuery.js";

// GET /devices
export const getAllDevices = async (req, res) => {
    try {
        const queries = {
            temperatureSensors: `
                SELECT 
                    ID,
                    Active,
                    LocationID,
                    UserID,
                    DateAdded
                FROM TemperatureSensors
            `,
            fanSensors: `
                SELECT 
                    ID,
                    Active,
                    LocationID,
                    UserID,
                    DateAdded
                FROM FanSensors
            `,
            cameraSensors: `
                SELECT 
                    ID,
                    Active,
                    LocationID,
                    UserID,
                    DateAdded
                FROM CameraSensors
            `,
            rfidScanners: `
                SELECT 
                    ID,
                    Active,
                    LocationID,
                    UserID,
                    DateAdded
                FROM RFIDScanners
            `
        };

        const [
            temperatureResult,
            fanResult,
            cameraResult,
            rfidResult
        ] = await Promise.all([
            executeQuery(queries.temperatureSensors),
            executeQuery(queries.fanSensors),
            executeQuery(queries.cameraSensors),
            executeQuery(queries.rfidScanners)
        ]);

        const normalize = (records, type) =>
            records.map(d => ({
                ...d,
                DeviceType: type
            }));

        const devices = [
            ...normalize(temperatureResult.recordset, "TemperatureSensor"),
            ...normalize(fanResult.recordset, "FanSensor"),
            ...normalize(cameraResult.recordset, "CameraSensor"),
            ...normalize(rfidResult.recordset, "RfidScanner")
        ];

        res.status(200).json({
            success: true,
            count: devices.length,
            devices
        });

    } catch (error) {
        console.error("Error fetching all device types:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch devices"
        });
    }
};
