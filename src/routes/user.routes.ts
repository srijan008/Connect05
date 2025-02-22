import express from 'express';
import { upload } from "../middlewares/multer.middelware"
import {getUser, changePassword, updateUser, createListing, updateListing, getAllListing, deleteListing, addFav, deleteFav,addto_shortlist,getShortlisted_listing } from '../controllers/user.controller';

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

router.post("/addto_shortlist", addto_shortlist);
router.get("/getShortlisted_listing", getShortlisted_listing);

export default router;