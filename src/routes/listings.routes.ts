import express, { Request, Response } from "express";
import { getListings,getListings_Shortlisted, getListings_Agent,updateListings,createListingFromJson } from "../controllers/listing.controller";
import { upload } from "../middlewares/multer.middelware"
import { getListingById,getListings_withselectedfield } from "../controllers/listing.controller";


const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
    await getListings(req, res);
});

router.put("/", async (req: Request, res: Response) => {
    await updateListings(req, res);
});

router.get("/getListings_withselectedfield",getListings_withselectedfield)
router.get("/getListings_Shortlisted",getListings_Shortlisted)
router.get("/getListings_Agent",getListings_Agent)
router.get("/getListingbyId/:lstId",getListingById)

router.post("/createListingFromJson",upload.single("listingFile"),createListingFromJson);

export default router;
