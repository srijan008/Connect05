import { userRepository } from "../db/schemas.db";
import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { User } from "../types/types";

const Salt: number = Number(process.env.SALT) || 10; // Ensure it's a number
const jwtSecret: string = process.env.JWT_SECRET ?? "secret"; // Use `??` for fallback
const expiresIn: string = process.env.JWT_EXPIRES_IN ?? "1h";


// Signup
async function signUp(req: Request, res: Response){
  try {
    const { name, email, password, mobile_number } = req.body;

    if (!name || !email || !password || !mobile_number) {
      res.status(400).send("Please enter all fields");
      return;
    }

    const existingUser = await userRepository.findOne({ where: { mobile_number } });

    if (existingUser) {
      res.status(409).send("User already exists");
      return;
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
      return;
    }

    const token = jwt.sign({ uid: (user as User).uid }, jwtSecret as string, { expiresIn } as SignOptions);

    res.status(201).json({
      message: "User registered successfully",
      token,
      // user,
    });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).send("Internal Server Error");
    return;
    
  }
}

// Login
async function login(req: Request, res: Response){

  const { mobile_number, password } = req.body;

  if(!mobile_number || !password){
    res.status(400).send("Please enter all fields");
    return;
  }

  try {

    const user = await userRepository.findOne({ where: { mobile_number } });

    if(!user){
      res.status(404).send("User not found");
      return;
    }

    const isMatch = await bcrypt.compare(password, user?.password as string);

    if(!isMatch){
      res.status(401).send("Invalid Credentials");
      return;
    }

    const token = jwt.sign({ uid: (user as User).uid }, jwtSecret as string, { expiresIn } as SignOptions);

    res.status(200).json({
      message: `${user?.name} logged in successfully`,
      token,
   
    });
    
  } catch (error) {
    // console.error("Login Error:", error);
    res.status(500).send("Internal Server Error");
    return;
    
  }

}

// get User
async function getUser(req: Request, res: Response){
  try {
    const user = await userRepository.findOne({ where: { uid: req.uid } });

    if (!user) {
      res.status(404).send("User not found");
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get User Error:", error);
    res.status(500).send("Internal Server Error");
    return
  }
  
}

//change password
async function changePassword(req:Request,res:Response) {

  const { oldPassword, newPassword } = req.body;

  const uid  = req.uid;  

  if(!oldPassword || !newPassword){
    res.status(400).send("Please enter all fields");
    return ;  }


  try {

    const user = await userRepository.findOne({ where: { uid } });

    const isMatch = await bcrypt.compare(oldPassword, user?.password as string);
    

    if(!isMatch){
      res.status(401).send("Invalid Credentials");
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, Salt);

    const updatedUser = await userRepository.update(uid,{
      password:hashedPassword
    });

    

    if(!updatedUser.affected || updatedUser.affected === 0){
      res.status(500).send("Error in updating password");
      return;
    }

    res.status(200).send("Password updated successfully");
    return;
    
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).send("Internal Server Error");
    return;
  }
  
}


// Update User
async function updateUser(req: Request, res: Response) {
  const { name , email, mobile_number} = req.body;

  if (!name && !email && !mobile_number) {
    res.status(400).send("At least one field is required");
    return;
  }

  const uid = req.uid;

  console.log(uid);
  

  try {
    const user = await userRepository.findOne({ where: { uid } });

    if (!user) {
      res.status(404).send("User not found");
      return;
    }

    const updatedUser = await userRepository.update(uid, {
      name: name || user.name,
      email: email || user.email,
      mobile_number: mobile_number || user.mobile_number,
    });

    if (!updatedUser) {
      res.status(500).send("Error in updating user");
      return;
    }

    res.status(200).send("User updated successfully");
    return;

    
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).send("Internal Server Error");
    return;
    
  }
}

export { signUp,login,getUser,changePassword,updateUser }
