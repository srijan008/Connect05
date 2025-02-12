"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_middelware_1 = require("../middlewares/multer.middelware");
const user_controller_1 = require("../controllers/user.controller");
const router = express_1.default.Router();
router.get('/getUser', user_controller_1.getUser);
router.post('/changePassword', user_controller_1.changePassword);
router.post('/updateUser', multer_middelware_1.upload.fields([{ name: "photo" }]), user_controller_1.updateUser);
router.post('/createListing', multer_middelware_1.upload.fields([{ name: "photo" }]), user_controller_1.createListing);
router.post('/updateListing/:lstId', multer_middelware_1.upload.fields([{ name: "photo" }]), user_controller_1.updateListing);
router.get('/getAllListing', user_controller_1.getAllListing);
router.delete('/deleteListing/:lstId', user_controller_1.deleteListing);
router.post("/addFav", user_controller_1.addFav);
router.delete("/deleteFav/:slNo", user_controller_1.deleteFav);
exports.default = router;
