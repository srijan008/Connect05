import { Router } from "express";
import { getCounter } from "../controllers/counter.controller";

const router = Router();

router.get("/", getCounter);

export default router;