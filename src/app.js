import express from 'express';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import keycardRoutes from './routes/keycards.js';
import locationsRoutes from './routes/locations.js';
import sensorTypesRoutes from './routes/sensorType.js';
import temperatureSensorRoutes from './routes/temperatureSensor.js';
import unitsRoutes from './routes/units.js';
import usersRoutes from './routes/users.js';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || 'localhost';

app.use('/auth', authRoutes);
app.use('/keycards', keycardRoutes);
app.use('/locations', locationsRoutes);
app.use('/sensor', sensorTypesRoutes);
app.use('/temperature', temperatureSensorRoutes);
app.use('/units', unitsRoutes);
app.use('/users', usersRoutes);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});