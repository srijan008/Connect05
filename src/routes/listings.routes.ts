import express, { Request, Response } from "express";
import { getListings, updateListings } from "../controllers/listing.controller";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
    await getListings(req, res);
});

router.put("/", async (req: Request, res: Response) => {
    await updateListings(req, res);
});

export default router;
