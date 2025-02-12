import jwt, { VerifyErrors } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET: string = process.env.JWT_SECRET || "secret";

// Extend Express Request type properly
declare global {
  namespace Express {
    interface Request {
      uid?: any;
      admin?:any;
      files?: {
        photo?: Express.Multer.File[]; // Assuming multiple files are uploaded under "photo"
    };
    }
  }
}

function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["authorization"];
  // const token = authHeader && authHeader.split(" ")[1];

  

  if (!token) {
     res.status(401).json({ message: "Access denied. No token provided." });
     return;
  }

  

  jwt.verify(token as string, JWT_SECRET, async (err: VerifyErrors | null, user: any) => {
    if (err) {
      console.log(err);
      res.status(403).json({ message: "Invalid or expired token" });
      return;
    }

    
    const dbUser = 1; // Example value, replace with actual DB query

    if (!dbUser) {
       res.status(403).json({ message: "Logged-in user not available" });
       return;
      } else if (dbUser > 1) {
        res.status(403).json({ message: "Conflict in user data" });
        return;
    }


    req.uid = user.uid;
    next();
  });
}

export default authenticateUser;
