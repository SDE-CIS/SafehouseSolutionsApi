/*
export const addFanActivity = async (req, res) => {
    try {
        const { Activation, FanMode, FanSpeed: inputFanSpeed, DeviceID } = req.body;

        const validFanModes = ['on', 'off', 'auto'];
        if (!validFanModes.includes(FanMode?.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: `Invalid FanMode value. Must be one of: ${validFanModes.join(', ')}.`
            });
        }

        let FanOn;
        let FanSpeed = inputFanSpeed || 0;

        switch (FanMode.toLowerCase()) {
            case 'off':
                FanOn = 0;
                FanSpeed = 0;
                break;
            case 'on':
                FanOn = 1;
                break;
            case 'auto':
                FanOn = null;
                break;
        }

        await executeQuery(
            `
            INSERT INTO FanData (Activation, ActivationTimestamp, FanOn, FanSpeed, FanMode, DeviceID)
            VALUES (@Activation, GETDATE(), @FanOn, @FanSpeed, @FanMode, @DeviceID);
            `,
            [
                { name: 'Activation', value: Activation || null },
                { name: 'FanOn', value: FanOn },
                { name: 'FanSpeed', value: FanSpeed },
                { name: 'FanMode', value: FanMode.toLowerCase() },
                { name: 'DeviceID', value: DeviceID || null }
            ]
        );

        res.status(201).json({ success: true, message: 'Fan activity record added successfully!' });
    } catch (error) {
        console.error('Add fan activity error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to add fan activity record.' });
    }
};

// POST /temperature/device/setting
export const addTemperatureSetting = async (req, res) => {
    try {
        const { MaxTemperature, NormalTemperature, MinTemperature, DeviceID } = req.body;

        await executeQuery(
            `
            INSERT INTO TemperatureSettings (MaxTemperature, NormalTemperature, MinTemperature, DeviceID)
            VALUES (@MaxTemperature, @NormalTemperature, @MinTemperature, @DeviceID);
            `,
            [
                { name: 'MaxTemperature', value: MaxTemperature },
                { name: 'NormalTemperature', value: NormalTemperature },
                { name: 'MinTemperature', value: MinTemperature },
                { name: 'DeviceID', value: DeviceID }
            ]
        );

        res.status(201).json({ success: true, message: 'New temperature setting registered successfully!' });
    } catch (error) {
        console.error('Add new temperature device error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to register new temperature setting.' });
    }
};
*/