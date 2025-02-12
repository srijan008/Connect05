import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authenticateUser from './middlewares/userAuth';
import { signUp, login } from './controllers/user.controller';

const app = express();
dotenv.config();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.get('/api', (req, res) => {
    res.send('Server is running');
});

app.post('/api/user/signUp', signUp);
app.post('/api/user/login', login);

import userRoutes from './routes/user.routes';
app.use('/api/user', authenticateUser, userRoutes);

import trackRoutes from './routes/track.routes';
app.use('/api/track', authenticateUser, trackRoutes);

import areaRoutes from './routes/area.routes';
app.use('/api/area', authenticateUser, areaRoutes);

import listingRoutes from './routes/listings.routes';
app.use('/api/listings', listingRoutes);

app.listen(4001, '0.0.0.0', () => {
    console.log('Server is running on http://0.0.0.0:4001');
});

