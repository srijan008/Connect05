"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userAuth_1 = __importDefault(require("../middlewares/userAuth"));
const track_controller_1 = require("../controllers/track.controller");
const router = express_1.default.Router();
router.post('/addTrack', userAuth_1.default, track_controller_1.addTrack);
router.post('/updateTrack/:tid', userAuth_1.default, track_controller_1.updateTrack);
router.get('/getTrack/:tid', userAuth_1.default, track_controller_1.getTrack);
router.delete('/deleteTrack/:tid', userAuth_1.default, track_controller_1.deleteTrack);
router.get('/getAllTrack', userAuth_1.default, track_controller_1.getAllTrack);
exports.default = router;
