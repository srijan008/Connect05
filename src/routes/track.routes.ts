import express from 'express';
import authenticateUser from '../middlewares/userAuth';
import { addTrack,updateTrack,getTrack,deleteTrack,getAllTrack} from '../controllers/track.controller';

const router = express.Router();

router.post('/addTrack',authenticateUser,addTrack)
router.post('/updateTrack/:tid',authenticateUser,updateTrack)
router.get('/getTrack/:tid',authenticateUser,getTrack)
router.delete('/deleteTrack/:tid',authenticateUser,deleteTrack)
router.get('/getAllTrack',authenticateUser,getAllTrack)

export default router;