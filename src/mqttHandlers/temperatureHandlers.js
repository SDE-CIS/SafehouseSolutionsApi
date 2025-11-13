import { executeQuery } from '../utils/executeQuery.js';

// Subscribe
export async function handleTemperaturInput(topic, message, client) {
    try {
        // Extract userId from the topic (first part)
        const topicParts = topic.split('/');
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

// Publish
export async function publishTemperatureSettings(client, userId, location, deviceId, settings) {
    try {
        const topic = `${userId}/temperatur/${location}/${deviceId}/settings`;
        const payload = JSON.stringify(settings);
        console.log(`Publishing temperature settings: ${payload}`);

        client.publish(topic, payload, { qos: 1 }, (err) => {
            if (err) {
                console.error('Failed to publish temperature settings:', err);
            } else {
                console.log(`Temperature settings published successfully to ${topic}`);
            }
        });
    } catch (err) {
        console.error('Unexpected error in publishTemperatureSettings:', err);
    }
}