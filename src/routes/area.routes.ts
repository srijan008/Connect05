import express from 'express';
import { addArea, updateArea,getArea } from '../controllers/area.controller';


const router = express.Router();
router.post('/addArea',addArea);
router.post('/updateArea/:slNo',updateArea);
router.get('/getArea/:slNo',getArea);



export default router;