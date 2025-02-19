import express, { Request, Response } from "express";
import { getListings, updateListings,createListingFromJson } from "../controllers/listing.controller";
import { upload } from "../middlewares/multer.middelware"

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
    await getListings(req, res);
});

router.put("/", async (req: Request, res: Response) => {
    await updateListings(req, res);
});

router.post("/createListingFromJson",upload.single("listingFile"),createListingFromJson);

export default router;
