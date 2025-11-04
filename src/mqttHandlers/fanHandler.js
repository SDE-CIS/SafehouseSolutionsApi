import { executeQuery } from '../utils/executeQuery.js';

export async function handleFanStateInput(topic, message, client) {
    try {
        // Extract userId from the topic (first part)
        const topicParts = topic.split('/');
        const userIdFromTopic = topicParts[0];
        const location = topicParts[2];
        const deviceId = parseInt(topicParts[3]);

        const msgStr = message.toString();
        let payload;

        console.log(`Message recived on topic: ${topic}`);

        try {
            payload = JSON.parse(msgStr);
        } catch (jsonErr) {
            console.error(`Failed to parse MQTT message as JSON: ${msgStr}`);
            return;
        }

        const fanOn = payload?.fanOn;
        const fanSpeed = payload?.fanSpeed;
        const fanMode = payload?.fanMode;
        if (!fanOn && !fanSpeed && !fanMode) {
            console.error(`Fan data not found in message: ${msgStr}`);
            return;
        }

        console.log(`Fan State data received: ${fanOn} from device: ${deviceId} (topic: ${topic})`);

        // Database query to insert fandata
        const query = `INSERT INTO FanData (ActivationTimestamp, DeviceID, FanOn, FanSpeed, FanMode)
                        VALUES (GETDATE(), @deviceId, @fanOn, @fanSpeed, @fanMode)`;

        await executeQuery(query, [
            { name: 'deviceId', value: deviceId }, { name: 'fanOn', value: fanOn },
            { name: 'fanSpeed', value: fanSpeed }, { name: 'fanMode', value: fanMode }]);

    } catch (err) {
        console.error('Unexpected error in handleFanStateInput:', err);
    }
}
