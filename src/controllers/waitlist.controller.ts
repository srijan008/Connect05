import { Request, Response } from "express";
import { AppDataSource } from "../db/dbConnection.db";
import Waitlist from "../models/waitlist.model";
import ErrorHandler from "../utils/errorHandling";
import { z } from "zod";

const waitlistSchema = z.object({
    name: z.string().min(1, "Name cannot be empty"),
    email: z.string().email("Invalid email format"),
});

async function joinWaitlist(req: Request, res: Response) {
    try {
        const waitlistData = waitlistSchema.parse(req.body);
        const waitlistRepo = AppDataSource.getRepository(Waitlist);

        const existingUser = await waitlistRepo.findOne({ where: { email: waitlistData.email } });
        if (existingUser) {
            res.status(400).json({ message: "Email already in waitlist" });
            return;
        }

        const newEntry = waitlistRepo.create(waitlistData);
        await waitlistRepo.save(newEntry);

        res.status(201).json({ message: "Successfully added to the waitlist", entry: newEntry });
    } catch (error) {
        ErrorHandler.handle(error, res);
    }
}

export { joinWaitlist };
