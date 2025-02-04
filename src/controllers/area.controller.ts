import e, { Request, Response } from "express";
import { areaRepository,trackRepository } from "../db/schemas.db";
import {area,Area} from "../types/types";
import ErrorHandler from "../utils/errorHandling";
import { z } from 'zod';


const areaSchema = z.object({
    lat: z.number({
        required_error: "Latitude is required",
        invalid_type_error: "Latitude must be a number"
    }),
    lon: z.number({
        required_error: "Longitude is required",
        invalid_type_error: "Longitude must be a number"   
    }),
    tid: z.number({
        required_error: "TrackingID is required",
        invalid_type_error: "TrackingID must be a number"
    })
});


const updateAreaSchema = z.object({
    lat: z.number({
        invalid_type_error: "Latitude must be a number",
    }).optional(),
    lon: z.number({
        invalid_type_error: "Longitude must be a number",
    }).optional(),
}).refine(data => data.lat !== undefined || data.lon !== undefined, {
    message: "At least one of 'lat' or 'lon' must be provided",
});

const areaIdSchema = z.object({
    slNo: z.string({
        required_error: "Area ID is required",
    }).transform(Number).refine(num => !isNaN(num), { message: "Invalid area ID" }),
});

async function addArea(req: Request, res: Response) {
    try {
        const areaData = areaSchema.parse(req.body) 
        const uid = req.uid;

        const trackExist = await trackRepository.count({where:{tid:areaData.tid,uid}});

        if(trackExist === 0){
            res.status(404).json({message:"Tracking ID not found or Tracking ID not linked to this user"});
            return;
        }

        const newArea: area = {
            lat: areaData.lat,
            lon: areaData.lon,
            tid: areaData.tid
        }

        const areaCreated = await areaRepository.save(newArea) as Area | null;

        if (!areaCreated) {
            res.status(500).json({ message: "Failed to add area" });
            return;
        }

        res.status(200).json({ message: "Area added successfully",area:areaCreated });
        return;
    } catch (error) {
        ErrorHandler.handle(error,res);
    }
}

// update area
async function updateArea(req: Request, res: Response) {

    
    try {

        const slNo = areaIdSchema.parse(req.params).slNo;
        const areaData = updateAreaSchema.parse(req.body);
        
        const area = await areaRepository.findOne({where:{slNo}}) as Area | undefined;

        if (!area) {
            res.status(404).json({ message: "Area not found" });
            return;
        }

        if(areaData.lat){
            area.lat = areaData.lat;
        }
        if(areaData.lon){
            area.lon = areaData.lon;
        }

        const updatedArea = await areaRepository.save(area);

        if(!updatedArea){
            res.status(500).json({message:"Failed to update area"});
            return;
        }

        res.status(200).json({message:"Area updated successfully",area:updatedArea});
        return;
        
    } catch (error) {
       ErrorHandler.handle(error,res) 
    }
}

async function getArea(req: Request, res: Response) {

    
    try {

        const slNo = areaIdSchema.parse(req.params).slNo;
        
        const area = await areaRepository.findOne({where:{slNo}}) as Area | undefined;

        if (!area) {
            res.status(404).json({ message: "Area not found" });
            return;
        }

        res.status(200).json({message:"Area found successfully",area});
        return;
        
    } catch (error) {
       ErrorHandler.handle(error,res) 
    }
}


export {addArea,updateArea,getArea}