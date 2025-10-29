import mqtt from 'mqtt';
import dotenv from 'dotenv';
import { executeQuery } from '../utils/executeQuery.js';

dotenv.config();

const mqttOptions = {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
};

const brokerUrl = process.env.MQTT_BROKER_URL;
if (!brokerUrl) {
    console.error('Error: MQTT_BROKER_URL is not defined');
    process.exit(1);
}

const client = mqtt.connect(brokerUrl, mqttOptions);
const scanTopic = `+/rfid/scan/tag/frontdoor/1`;

client.on('connect', () => {
    console.log('Connected to MQTT broker');

    client.subscribe(scanTopic, (err) => {
        if (err) {
            console.error(`Failed to subscribe to "${scanTopic}" topic:`, err);
        } else {
            console.log(`Subscribed to "${scanTopic}"`);
        }
    });
});

client.on('error', (err) => {
    console.error('MQTT Client error:', err);
});

client.on('message', async (topic, message) => {
    let rfidTag;

    try {
        const msgStr = message.toString();
        let payload;

        try {
            payload = JSON.parse(msgStr);
        } catch (jsonErr) {
            console.error(`Failed to parse MQTT message as JSON: ${msgStr}`);
            return;
        }

        rfidTag = payload?.cardUID;

        if (!rfidTag) {
            console.error(`cardUID not found in message: ${msgStr}`);
            return;
        }

        console.log(`RFID cardUID received on ${topic}: ${rfidTag} (type: ${typeof rfidTag})`);

        const query = 'SELECT TOP 1 UserID, id FROM Keycards WHERE RfidTag = @tag';
        const result = await executeQuery(query, [
            { name: 'tag', value: rfidTag.toString() }
        ]);

        let authorised = false;
        let userId = 'unknown';

        if (result.recordset.length > 0) {
            authorised = true;
            userId = result.recordset[0].UserID;
        }

        const responseTopic = `${userId}/RFID/frontdoor/1/scan/${rfidTag}`;
        const responsePayload = JSON.stringify({ authorisation: authorised.toString() });

        client.publish(responseTopic, responsePayload, { qos: 1 }, (err) => {
            if (err) console.error('Failed to publish response:', err);
            else console.log(`Published authorisation to ${responseTopic}: ${responsePayload}`);
        });
    } catch (err) {
        console.error('Unexpected error processing message:', err);
    }
});

export default client;