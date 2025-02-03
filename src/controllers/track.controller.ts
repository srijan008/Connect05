import { trackRepository} from "../db/schemas.db";
import { Request, Response } from "express";
import { track,Track } from "../types/types";
import { DeleteResult } from "typeorm";


const addTrack = async (req: Request, res: Response) => {
    const uid = req.uid;

    try {
        const { area, isActive } = req.body;

        

        if (!area || !isActive) {
            res.status(400).json({ error: "Please provide all the required fields" });
            return;
        }
        const newTrack: track = {uid, area, isActive }

        const track = await trackRepository.save(newTrack); 

        if(!track){
            res.status(400).json({ error: "Failed to add track" });
            return;
        }


        res.status(201).json(track);
    } catch (error) {
        res.status(500).json({ error });
        return;
    }
}

const getAllTrack = async (req: Request, res: Response) => {

    const uid = req.uid;

   try {
     const track = await trackRepository.find({ where: { uid } }) as Track[] | null;
 
     if(!track || track.length === 0){
         res.status(404).json({ error: "Tracks not found" });
         return;
     }

     

     res.status(200).json({message:"Tracks Found Successfully",tracks:track});
   return 

   } catch (error) {
       res.status(500).json({ error });
       return;
    
   }


}

const getTrack = async (req: Request, res: Response) => {

    const tid = Number(req.params.tid);
    const uid = req.uid;

    if(!tid){
        res.status(400).json({ error: "Please provide track id" });
        return;
    }

   try {
    const track= await trackRepository.findOne({ where: { tid, uid } }) as Track | null
    
     if(!track){
         res.status(404).json({ error: "Track not found" });
         return;
     }

     res.status(200).json({message:"Track Found Successfully",track});
     return 

   } catch (error) {
       res.status(500).json({ error });
       return;
    
   }


}

const updateTrack = async (req: Request, res: Response) => {

    const tid = Number(req.params.tid);
    const uid = req.uid;


    const {area,isActive} = req.body;

    if(!tid){
        res.status(400).json({ error: "Please provide track id" });
        return;
    }

   try {
     const track = await trackRepository.findOne({ where: { tid, uid } }) as Track | null;
 
     if(!track){
         res.status(404).json({ error: "Track not found" });
         return;
     }

        if(area){
            track.area = area;
        }
        if(isActive === true || isActive === false){
            track.isActive = isActive;
        }

        const updatedTrack = await trackRepository.save(track) as Track | null;

        if(!updatedTrack){
            res.status(400).json({ error: "Failed to update track" });
            return;
        }


        res.status(200).json({message:"Track Updated Successfully",updatedTrack});
        return 
   
   } catch (error) {
       res.status(500).json({ error });
       return;
    
   }


}

const deleteTrack = async (req: Request, res: Response) => {
    const tid = Number(req.params.tid);
    const uid = Number(req.uid); // Ensure uid is a number

    if (!tid || isNaN(tid)) {
        res.status(400).json({ error: "Please provide a valid track ID" });
        return 
    }

    try {
        const deleteResult: DeleteResult = await trackRepository.delete({ tid, uid });

        if (deleteResult.affected === 0) {
            res.status(404).json({ error: "Track not found or already deleted" });
            return 
        }

        res.status(200).json({ message: "Track deleted successfully" });
        return

    } catch (error) {
        console.error("Error deleting track:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
        return 
    }
};


export {addTrack,getAllTrack,getTrack,updateTrack,deleteTrack}