import multer, { StorageEngine } from "multer";
import { Request } from "express";
import path from "path";
import fs from "fs";

// Define storage configuration
const storage: StorageEngine = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void): void {
        // Use absolute path for destination folder
        const uploadPath = path.resolve(__dirname, "../../public/temp/");
        
        // Check if the directory exists and create it if it doesn't
        fs.mkdirSync(uploadPath, { recursive: true });

        cb(null, uploadPath);
    },
    filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void): void {
        cb(null, file.originalname); // You can also modify the filename here if needed
    }
});

export const upload = multer({ storage });
