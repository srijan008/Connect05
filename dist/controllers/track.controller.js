"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTrack = exports.updateTrack = exports.getTrack = exports.getAllTrack = exports.addTrack = void 0;
const schemas_db_1 = require("../db/schemas.db");
const addTrack = async (req, res) => {
    const uid = req.uid;
    try {
        const { area, isActive } = req.body;
        if (!area || !isActive) {
            res.status(400).json({ error: "Please provide all the required fields" });
            return;
        }
        const newTrack = { uid, area, isActive };
        const track = await schemas_db_1.trackRepository.save(newTrack);
        if (!track) {
            res.status(400).json({ error: "Failed to add track" });
            return;
        }
        res.status(201).json(track);
    }
    catch (error) {
        res.status(500).json({ error });
        return;
    }
};
exports.addTrack = addTrack;
const getAllTrack = async (req, res) => {
    const uid = req.uid;
    try {
        const track = await schemas_db_1.trackRepository.find({ where: { uid } });
        if (!track || track.length === 0) {
            res.status(404).json({ error: "Tracks not found" });
            return;
        }
        res.status(200).json({ message: "Tracks Found Successfully", tracks: track });
        return;
    }
    catch (error) {
        res.status(500).json({ error });
        return;
    }
};
exports.getAllTrack = getAllTrack;
const getTrack = async (req, res) => {
    const tid = Number(req.params.tid);
    const uid = req.uid;
    if (!tid) {
        res.status(400).json({ error: "Please provide track id" });
        return;
    }
    try {
        const track = await schemas_db_1.trackRepository.findOne({ where: { tid, uid } });
        if (!track) {
            res.status(404).json({ error: "Track not found" });
            return;
        }
        res.status(200).json({ message: "Track Found Successfully", track });
        return;
    }
    catch (error) {
        res.status(500).json({ error });
        return;
    }
};
exports.getTrack = getTrack;
const updateTrack = async (req, res) => {
    const tid = Number(req.params.tid);
    const uid = req.uid;
    const { area, isActive } = req.body;
    if (!tid) {
        res.status(400).json({ error: "Please provide track id" });
        return;
    }
    try {
        const track = await schemas_db_1.trackRepository.findOne({ where: { tid, uid } });
        if (!track) {
            res.status(404).json({ error: "Track not found" });
            return;
        }
        if (area) {
            track.area = area;
        }
        if (isActive === true || isActive === false) {
            track.isActive = isActive;
        }
        const updatedTrack = await schemas_db_1.trackRepository.save(track);
        if (!updatedTrack) {
            res.status(400).json({ error: "Failed to update track" });
            return;
        }
        res.status(200).json({ message: "Track Updated Successfully", updatedTrack });
        return;
    }
    catch (error) {
        res.status(500).json({ error });
        return;
    }
};
exports.updateTrack = updateTrack;
// will also delete the area associated with the track
const deleteTrack = async (req, res) => {
    const tid = Number(req.params.tid);
    const uid = Number(req.uid); // Ensure uid is a number
    if (!tid || isNaN(tid)) {
        res.status(400).json({ error: "Please provide a valid track ID" });
        return;
    }
    try {
        const deleteResult = await schemas_db_1.trackRepository.delete({ tid, uid });
        if (deleteResult.affected === 0) {
            res.status(404).json({ error: "Track not found or already deleted" });
            return;
        }
        res.status(200).json({ message: "Track deleted successfully" });
        return;
    }
    catch (error) {
        console.error("Error deleting track:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
        return;
    }
};
exports.deleteTrack = deleteTrack;
