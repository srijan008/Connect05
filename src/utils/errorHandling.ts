import { Response } from "express";
import { ZodError } from "zod";

class ErrorHandler {
    static handle(error: unknown, res: Response) {
        if (error instanceof ZodError) {
            res.status(400).json({ errors: error.errors.map(err => err.message) });
            return;
        }

        console.error("Unexpected Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
}

export default ErrorHandler;
