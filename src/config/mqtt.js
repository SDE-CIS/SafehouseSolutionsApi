import mqtt from 'mqtt';
import dotenv from 'dotenv';
import { executeQuery } from '../utils/executeQuery.js';
import { handleRfidScan, handleAssignRfid } from '../mqttHandlers/rfidHandlers.js';
import { handleTemperaturInput } from '../mqttHandlers/temperatureHandlers.js';
import { handleFanStateInput, publishFanSettings } from '../mqttHandlers/fanHandler.js';

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

const topicHandlers = {
    '+/rfid/frontdoor/1/scan': handleRfidScan,
    'rfid/assign': handleAssignRfid,
    '+/temperatur/+/+': handleTemperaturInput,
    '+/temperatur/+/+/fanState': handleFanStateInput
}
const topics = Object.keys(topicHandlers);

client.on('connect', () => {
    console.log('Connected to MQTT broker');

    client.subscribe(topics, (err, granted) => {
        if (err) console.error(`Failed to subscribe: ${err}`);
        else console.log(`Subscribed to ${granted.map(g => g.topic).join(', ')}`);
    });
});

client.on('error', (err) => {
    console.error('MQTT Client error:', err);
});

client.on('message', (topic, message) => {
    for (const pattern in topicHandlers) {
        // Convert MQTT wildcards to regex
        const regex = new RegExp('^' + pattern.replace(/\+/g, '[^/]+').replace(/#/g, '.*') + '$');
        if (regex.test(topic)) {
            topicHandlers[pattern](topic, message, client);
            return;
        }
    }
    console.warn(`No handler for topic: ${topic}`);
});

export default client;