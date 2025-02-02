import { userRepository } from "../db/schemas.db";
import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { User } from "../types/user.types";

const Salt: number = Number(process.env.SALT) || 10; // Ensure it's a number
const jwtSecret: string = process.env.JWT_SECRET ?? "secret"; // Use `??` for fallback
const expiresIn: string = process.env.JWT_EXPIRES_IN ?? "1h";

async function signUp(req: Request, res: Response,next:NextFunction){
  try {
    const { name, email, password, mobile_number } = req.body;

    if (!name || !email || !password || !mobile_number) {
      res.status(400).send("Please enter all fields");
    }

    const existingUser = await userRepository.findOne({ where: { mobile_number } });

    if (existingUser) {
      res.status(409).send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, Salt);

    const user = await userRepository.save({
      name,
      email,
      password: hashedPassword,
      mobile_number,
    });

    if (!user) {
      res.status(500).send("Error in registering user");
    }

    const token = jwt.sign({ id: (user as User).uid }, jwtSecret as string, { expiresIn } as SignOptions);

    res.status(201).json({
      message: "User registered successfully",
      token,
      // user,
    });

  } catch (error) {
    console.error("Signup Error:", error);
    // return res.status(500).send("Internal Server Error");
    next(error);
  }
}

export { signUp }
