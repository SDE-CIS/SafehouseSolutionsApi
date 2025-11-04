import { executeQuery } from '../utils/executeQuery.js';

export async function handleTemperaturInput(topic, message, client) {
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

        const temp = payload?.temperatur;
        if (!temp) {
            console.error(`temperature not found in message: ${msgStr}`);
            return;
        }

        console.log(`Temperature data received: ${temp} from device: ${deviceId} (topic: ${topic})`);

        // Database query to insert temperature
        const query = `INSERT INTO TemperatureData (Temperature, TemperatureTimestamp, DeviceID)
                        VALUES (@temp, GETDATE(), @deviceId)`;

        await executeQuery(query, [{ name: 'temp', value: temp }, { name: 'deviceId', value: deviceId }]);

    } catch (err) {
        console.error('Unexpected error in handletemperatureInsert:', err);
    }
}
