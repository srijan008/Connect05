import express from 'express';
import { upload } from "../middlewares/multer.middelware"
import {getUser, changePassword, updateUser, createListing, updateListing, getAllListing, deleteListing, addFav, deleteFav } from '../controllers/user.controller';

const router = express.Router();


router.get('/getUser',  getUser)
router.post('/changePassword',  changePassword)
router.post('/updateUser',  upload.fields([{ name: "photo" }]), updateUser)


router.post('/createListing',  upload.fields([{ name: "photo" }]), createListing)
router.post('/updateListing/:lstId',  upload.fields([{ name: "photo" }]), updateListing)
router.get('/getAllListing',  getAllListing)
router.delete('/deleteListing/:lstId',  deleteListing)

router.post("/addFav", addFav);
router.delete("/deleteFav/:slNo", deleteFav);

export default router;