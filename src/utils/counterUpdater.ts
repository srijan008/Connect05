import { AppDataSource } from "../db/dbConnection.db";
import Counter from "../models/counter.model";

const counterRepo = AppDataSource.getRepository(Counter);

export const updateCounter = async () => {
    let counter = await counterRepo.findOne({ where: { id: 1 } });

    if (!counter) {
        counter = counterRepo.create({ value: 1800 });
        await counterRepo.save(counter);
    }

    const increment = Math.floor(Math.random() * 3);
    counter.value = Number(counter.value) + increment;
    await counterRepo.save(counter);
};

setInterval(updateCounter, 60000);