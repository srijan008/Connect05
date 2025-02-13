import { Request, Response } from "express";
import { AppDataSource } from "../db/dbConnection.db";
import Counter from "../models/counter.model";

const counterRepo = AppDataSource.getRepository(Counter);

export const getCounter = async (req: Request, res: Response) => {
    let counter = await counterRepo.findOne({ where: { id: 1 } });

    if (!counter) {
        counter = counterRepo.create({ value: 1800 });
        await counterRepo.save(counter);
    }

    res.json({ value: counter.value });
};