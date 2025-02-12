"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
class ErrorHandler {
    static handle(error, res) {
        if (error instanceof zod_1.ZodError) {
            res.status(400).json({ errors: error.errors.map(err => err.message) });
            return;
        }
        console.error("Unexpected Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
}
exports.default = ErrorHandler;
