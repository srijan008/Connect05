"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addArea = addArea;
exports.updateArea = updateArea;
exports.getArea = getArea;
const schemas_db_1 = require("../db/schemas.db");
const errorHandling_1 = __importDefault(require("../utils/errorHandling"));
const zod_1 = require("zod");
const areaSchema = zod_1.z.object({
    lat: zod_1.z.number({
        required_error: "Latitude is required",
        invalid_type_error: "Latitude must be a number"
    }),
    lon: zod_1.z.number({
        required_error: "Longitude is required",
        invalid_type_error: "Longitude must be a number"
    }),
    tid: zod_1.z.number({
        required_error: "TrackingID is required",
        invalid_type_error: "TrackingID must be a number"
    })
});
const updateAreaSchema = zod_1.z.object({
    lat: zod_1.z.number({
        invalid_type_error: "Latitude must be a number",
    }).optional(),
    lon: zod_1.z.number({
        invalid_type_error: "Longitude must be a number",
    }).optional(),
}).refine(data => data.lat !== undefined || data.lon !== undefined, {
    message: "At least one of 'lat' or 'lon' must be provided",
});
const areaIdSchema = zod_1.z.object({
    slNo: zod_1.z.string({
        required_error: "Area ID is required",
    }).transform(Number).refine(num => !isNaN(num), { message: "Invalid area ID" }),
});
async function addArea(req, res) {
    try {
        const areaData = areaSchema.parse(req.body);
        const uid = req.uid;
        const trackExist = await schemas_db_1.trackRepository.count({ where: { tid: areaData.tid, uid } });
        if (trackExist === 0) {
            res.status(404).json({ message: "Tracking ID not found or Tracking ID not linked to this user" });
            return;
        }
        const newArea = {
            lat: areaData.lat,
            lon: areaData.lon,
            tid: areaData.tid
        };
        const areaCreated = await schemas_db_1.areaRepository.save(newArea);
        if (!areaCreated) {
            res.status(500).json({ message: "Failed to add area" });
            return;
        }
        res.status(200).json({ message: "Area added successfully", area: areaCreated });
        return;
    }
    catch (error) {
        errorHandling_1.default.handle(error, res);
    }
}
// update area
async function updateArea(req, res) {
    try {
        const slNo = areaIdSchema.parse(req.params).slNo;
        const areaData = updateAreaSchema.parse(req.body);
        const area = await schemas_db_1.areaRepository.findOne({ where: { slNo } });
        if (!area) {
            res.status(404).json({ message: "Area not found" });
            return;
        }
        if (areaData.lat) {
            area.lat = areaData.lat;
        }
        if (areaData.lon) {
            area.lon = areaData.lon;
        }
        const updatedArea = await schemas_db_1.areaRepository.save(area);
        if (!updatedArea) {
            res.status(500).json({ message: "Failed to update area" });
            return;
        }
        res.status(200).json({ message: "Area updated successfully", area: updatedArea });
        return;
    }
    catch (error) {
        errorHandling_1.default.handle(error, res);
    }
}
async function getArea(req, res) {
    try {
        const slNo = areaIdSchema.parse(req.params).slNo;
        const area = await schemas_db_1.areaRepository.findOne({ where: { slNo } });
        if (!area) {
            res.status(404).json({ message: "Area not found" });
            return;
        }
        res.status(200).json({ message: "Area found successfully", area });
        return;
    }
    catch (error) {
        errorHandling_1.default.handle(error, res);
    }
}
