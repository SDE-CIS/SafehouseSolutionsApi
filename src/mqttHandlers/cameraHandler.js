import { executeQuery } from '../utils/executeQuery.js';

export async function handleCameraAlertsInput(topic, message, client) {
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

        const timestamp = payload?.timestamp;
        const image = payload?.image;
        if (!timestamp && !image) {
            console.error(`Alert data not found in message: ${msgStr}`);
            return;
        }

        const imageBuffer = Buffer.from(image, "base64");

        console.log(`Camera Alert data received: ${timestamp} from device: ${deviceId} (topic: ${topic})`);

        const query = `
            INSERT INTO CameraData (CameraImage, ImageTimestamp, DeviceID)
            VALUES (@CameraImage, @ImageTimestamp, @DeviceID)
        `;

        await executeQuery(query, [
            { name: "CameraImage", value: imageBuffer }, { name: "ImageTimestamp", value: timestamp },
            { name: "DeviceID", value: deviceId }
        ])

    } catch (err) {
        console.error('Unexpected error in handleCameraAlertInput:', err);
    }
}
