import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import client from "./config/mqtt.js";

import authRoutes from './routes/auth.js';
import keycardRoutes from './routes/keycards.js';
import locationsRoutes from './routes/locations.js';
import sensorTypesRoutes from './routes/sensorType.js';
import temperatureSensorRoutes from './routes/temperatureSensor.js';
import unitsRoutes from './routes/units.js';
import usersRoutes from './routes/users.js';
import videosRoutes from './routes/videos.js';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || 'localhost';

// CORS
app.use(cors({ origin: '*', credentials: true }));

app.use('/auth', authRoutes);
app.use('/keycards', keycardRoutes);
app.use('/locations', locationsRoutes);
app.use('/sensor', sensorTypesRoutes);
app.use('/temperature', temperatureSensorRoutes);
app.use('/units', unitsRoutes);
app.use('/users', usersRoutes);
app.use("/videos", videosRoutes);

app.get('/', (req, res) => {
  res.send('Safehouse Solutions API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on ${typeof PORT === 'string' ? PORT : `http://${HOST}:${PORT}`}`);
});