"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const listing_controller_1 = require("../controllers/listing.controller");
const router = express_1.default.Router();
router.get("/", async (req, res) => {
    await (0, listing_controller_1.getListings)(req, res);
});
router.put("/", async (req, res) => {
    await (0, listing_controller_1.updateListings)(req, res);
});
exports.default = router;
