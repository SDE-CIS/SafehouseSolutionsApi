import { executeQuery } from '../utils/executeQuery.js';

// Subscribe
export async function handleFanStateInput(topic, message, client) {
    try {
        // Extract userId from the topic (first part)
        const topicParts = topic.split('/');
        //const userIdFromTopic = topicParts[0];
        //const location = topicParts[2];
        const deviceId = parseInt(topicParts[3]);

        const msgStr = message.toString();
        let payload;

        console.log(`Message recieved on topic: ${topic}`);

        try {
            payload = JSON.parse(msgStr);
        } catch (jsonErr) {
            console.error(`Failed to parse MQTT message as JSON: ${msgStr}`);
            return;
        }

        const { fanOn, fanSpeed: inputFanSpeed, fanMode } = payload;

        if (!fanOn && !inputFanSpeed && !fanMode) {
            console.error(`Fan data not found in message: ${msgStr}`);
            return;
        }

        console.log(`Fan State data received: ${fanOn} from device: ${deviceId} (topic: ${topic})`);

        const validFanModes = ['on', 'off', 'auto'];
        const FanMode = fanMode?.toLowerCase();

        if (!validFanModes.includes(FanMode)) {
            console.error(`Invalid FanMode value "${fanMode}". Must be one of: ${validFanModes.join(', ')}`);
            return;
        }

        let FanOn;
        let FanSpeed = inputFanSpeed || 0;

        switch (FanMode) {
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

        const query = `
            INSERT INTO FanData (ActivationTimestamp, FanOn, FanSpeed, FanMode, DeviceID)
            VALUES (GETDATE(), @FanOn, @FanSpeed, @FanMode, @DeviceID);
        `;

        await executeQuery(query, [
            { name: 'FanOn', value: FanOn },
            { name: 'FanSpeed', value: FanSpeed },
            { name: 'FanMode', value: FanMode },
            { name: 'DeviceID', value: deviceId }
        ]);

        console.log(`Fan activity record added successfully for device ${deviceId}`);
    } catch (err) {
        console.error('Unexpected error in handleFanStateInput:', err);
    }
}

// Publish
export async function publishFanSettings(client, userId, location, deviceId, settings) {
    try {
        const topic = `${userId}/fan/${location}/${deviceId}/settings`;
        const payload = JSON.stringify(settings);
        console.log(`Payload: ${payload}`);

        client.publish(topic, payload, { qos: 1 }, (err) => {
            if (err) {
                console.error(`Failed to publish fan settings:`, err);
            } else {
                console.log(`Fan settings published successfully to ${topic}`);
            }
        });
    } catch (err) {
        console.error('Unexpected error in publishFanSettings:', err);
    }
}