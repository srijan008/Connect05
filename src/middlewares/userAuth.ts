import jwt, { VerifyErrors } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET: string = process.env.JWT_SECRET || "secret";

// Extend Express Request type properly
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, JWT_SECRET, async (err: VerifyErrors | null, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    
    const dbUser = 1; // Example value, replace with actual DB query

    if (!dbUser) {
      return res.status(403).json({ message: "Logged-in user not available" });
    } else if (dbUser > 1) {
      return res.status(403).json({ message: "Conflict in user data" });
    }

    req.user = user;
    next();
  });
}

export default authenticateUser;
