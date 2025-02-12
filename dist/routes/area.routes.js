"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const area_controller_1 = require("../controllers/area.controller");
const router = express_1.default.Router();
router.post('/addArea', area_controller_1.addArea);
router.post('/updateArea/:slNo', area_controller_1.updateArea);
router.get('/getArea/:slNo', area_controller_1.getArea);
exports.default = router;
