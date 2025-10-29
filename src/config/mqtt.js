import mqtt from 'mqtt';
//import { executeQuery } from './utils/executeQuery.js';
import dotenv from 'dotenv';
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
const userId = '1';
const topic = `${userId}/rfid/scan/tag/frontdoor/1`;

client.on('connect', () => {
  console.log('Connected to MQTT broker');

  client.subscribe(topic, (err) => {
    if (err) {
      console.error(`Failed to subscribe to "${topic}" topic:`, err);
    } else {
      console.log(`Subscribed to "${topic}"`);
    }
  });
});

client.on('error', (err) => {
  console.error('MQTT Client error:', err);
});

client.on('message', (topic, message) => {
  console.log(`Message received on ${topic}:`, message.toString());
});

export default client;