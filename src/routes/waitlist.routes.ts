import { Router } from "express";
import { joinWaitlist } from "../controllers/waitlist.controller";

const router = Router();

router.post("/join", async (req, res) => joinWaitlist(req, res));

export default router;
