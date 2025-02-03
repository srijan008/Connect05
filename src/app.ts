import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';


const app = express();
dotenv.config();


// Middleware
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/api', (req, res) => {
    res.send('Server is running');
})

import userRoutes from './routes/user.routes';
app.use('/api/user', userRoutes);

import trackRoutes from './routes/track.routes';
app.use('/api/track', trackRoutes);





app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});