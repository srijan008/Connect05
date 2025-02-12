"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || "secret";
function authenticateUser(req, res, next) {
    const token = req.headers["authorization"];
    // const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Access denied. No token provided." });
        return;
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, async (err, user) => {
        if (err) {
            console.log(err);
            res.status(403).json({ message: "Invalid or expired token" });
            return;
        }
        const dbUser = 1; // Example value, replace with actual DB query
        if (!dbUser) {
            res.status(403).json({ message: "Logged-in user not available" });
            return;
        }
        else if (dbUser > 1) {
            res.status(403).json({ message: "Conflict in user data" });
            return;
        }
        req.uid = user.uid;
        next();
    });
}
exports.default = authenticateUser;
