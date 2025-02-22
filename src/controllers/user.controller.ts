import { userRepository, favListRepository, listingRepository,ShortListRepository } from "../db/schemas.db";
import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { User } from "../types/types";
import ErrorHandler from "../utils/errorHandling";
import { DeleteResult, In } from "typeorm";
import { ListingSchema } from "../utils/zodSchemas.utils";
import { compressImage, uploadToS3 } from "../utils/image.utils";
import { all } from "axios";


const Salt: number = Number(process.env.SALT) || 10;
const jwtSecret: string = process.env.JWT_SECRET ?? "secret";
const expiresIn: string = process.env.JWT_EXPIRES_IN ?? "1h";

async function signUp(req: Request, res: Response) {
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
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).send("Internal Server Error");
    return;
  }
}

async function login(req: Request, res: Response) {
  const { mobile_number, password } = req.body;
  if (!mobile_number || !password) {
    res.status(400).send("Please enter all fields");
    return;
  }
  try {
    const user = await userRepository.findOne({ where: { mobile_number } });
    if (!user) {
      res.status(404).send("User not found");
      return;
    }
    const isMatch = await bcrypt.compare(password, user?.password as string);
    if (!isMatch) {
      res.status(401).send("Invalid Credentials");
      return;
    }
    const token = jwt.sign({ uid: (user as User).uid }, jwtSecret as string, { expiresIn } as SignOptions);
    res.status(200).json({
      message: `${user?.name} logged in successfully`,
      token,
    });
  } catch (error) {
    res.status(500).send("Internal Server Error");
    return;
  }
}

async function getUser(req: Request, res: Response) {
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
    return;
  }
}

async function changePassword(req: Request, res: Response) {
  const { oldPassword, newPassword } = req.body;
  const uid = req.uid;
  if (!oldPassword || !newPassword) {
    res.status(400).send("Please enter all fields");
    return;
  }
  try {
    const user = await userRepository.findOne({ where: { uid } });
    const isMatch = await bcrypt.compare(oldPassword, user?.password as string);
    if (!isMatch) {
      res.status(401).send("Invalid Credentials");
      return;
    }
    const hashedPassword = await bcrypt.hash(newPassword, Salt);
    const updatedUser = await userRepository.update(uid, {
      password: hashedPassword
    });
    if (!updatedUser.affected || updatedUser.affected === 0) {
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

async function updateUser(req: Request, res: Response) {
  const { name, email, mobile_number } = req.body;
  if (!name && !email && !mobile_number) {
    res.status(400).send("At least one field is required");
    return;
  }
  const uid = req.uid;
  const file = req.file;
  console.log(uid);
  try {
    const user = await userRepository.findOne({ where: { uid } });
    if (!user) {
      res.status(404).send("User not found");
      return;
    }
    if (file) {
      const uploadResult = await uploadToS3(file);
      if (uploadResult) { user.profilePhoto = uploadResult; }
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

async function createListing(req: Request, res: Response) {
  try {
    const listingData = ListingSchema.parse(req.body);
    const files = req.files?.photo;
    const listing = await listingRepository.save({ ...listingData });
    if (!listing) {
      res.status(400).json({ message: "Failed to add listing" });
      return;
    }
    if (files && files?.length > 0) {
      if (!listing.image) { listing.image = []; }
      const uploadToAws = files.map(async (file) => {
        try {
          const uploadResult = await uploadToS3(file);
          if (uploadResult && uploadResult !== null) {
            listing.image?.push(uploadResult);
          }
        } catch (error) {
          console.error(`Error uploading file ${file.filename}:`, error);
        }
      });
      await Promise.all(uploadToAws);
    }
    const savedListing = await listingRepository.save(listing);
    if (!savedListing) {
      res.status(400).json({ message: "Failed to add listing" });
      return;
    }
    res.status(200).json({ message: "Listing added successfully", listing: savedListing });
    return;
  } catch (error) {
    ErrorHandler.handle(error, res);
  }
}

async function updateListing(req: Request, res: Response) {
  try {
    const lstId = Number(req.params.lstId);
    const files = req.files?.photo;
    const updatedListingData = req.body;
    if (Object.keys(updatedListingData).length === 0) {
      res.status(400).json({ message: "Please provide data to update" });
      return;
    }
    const listing = await listingRepository.findOne({ where: { lstId } });
    if (!listing) {
      res.status(400).json({ message: "Listing not found" });
      return;
    }
    Object.keys(updatedListingData).forEach((key) => {
      if (updatedListingData[key] === "") updatedListingData[key] = null;
    });
    Object.assign(listing, updatedListingData);
    if (files && files?.length > 0) {
      if (!listing.image) { listing.image = []; }
      const uploadToAws = files.map(async (file) => {
        try {
          const uploadResult = await uploadToS3(file);
          if (uploadResult && uploadResult !== null) {
            (listing.image as string[])?.push(uploadResult);
          }
        } catch (error) {
          console.error(`Error uploading file ${file.filename}:`, error);
        }
      });
      await Promise.all(uploadToAws);
    }
    const updatedListing = await listingRepository.save(listing);
    if (!updatedListing) {
      res.status(400).json({ message: "Failed to update listing" });
      return;
    }
    res.status(200).json({ message: "Listing updated successfully", listing: updatedListing });
    return;
  } catch (error) {
    ErrorHandler.handle(error, res);
  }
}

async function getAllListing(req: Request, res: Response) {
  try {
    const allListings = await listingRepository.find();
    if (allListings.length === 0) {
      res.status(400).json({ message: "No listing found" });
      return;
    }
    res.status(200).json({ message: "Listings Found successfully", allListings });
  } catch (error) {
    ErrorHandler.handle(error, res);
  }
}

async function deleteListing(req: Request, res: Response) {
  try {
    const lstId = req.params.lstId;
    const deleteFav = await favListRepository.delete({ lstId });
    const deleteListing: DeleteResult = await listingRepository.delete({ lstId });
    if (deleteListing.affected === 0) {
      res.status(400).json({ message: "Unable to delete the listing" });
      return;
    }
    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (error) {
    ErrorHandler.handle(error, res);
  }
}

async function addFav(req: Request, res: Response) {
  try {
    const uid = req.uid;
    const { tid, lstId } = req.body;
    if (!lstId) {
      res.status(400).json({ message: "Please provide lstId" });
      return;
    }
    const favData = {
      tid: tid,
      lstId: lstId,
      uid: uid
    };
    const fav = await favListRepository.save(favData);
    if (!fav) {
      res.status(400).json({ message: "Failed to add fav" });
      return;
    }
    res.status(200).json({ message: "Fav added successfully" });
    return;
  } catch (error) {
    ErrorHandler.handle(error, res);
  }
}

async function deleteFav(req: Request, res: Response) {
  try {
    const uid = req.uid;
    const { slNo } = req.params;
    const deleteFav: DeleteResult = await favListRepository.delete({ slNo, uid });
    if (deleteFav.affected === 0) {
      res.status(400).json({ message: "Failed to delete fav" });
      return;
    }
    res.status(200).json({ message: "Fav deleted successfully" });
    return;
  } catch (error) {
    ErrorHandler.handle(error, res);
  }
}

const addto_shortlist = async (req: Request, res: Response): Promise<void> => {
  const uid = req.uid;
  try {
    const { lstId } = req.body;
    if (!lstId) {
      res.status(400).json({ message: "Please provide lstId" });
      return;
    }
    const listing = await listingRepository.findOne({ where: { lstId } });

    if (!listing) {
      res.status(400).json({ message: "Listing not found" });
      return;
    }

    const shortListData = {
      lstId: lstId,
      uid: uid
    };
    const shortList = await ShortListRepository.save(shortListData);
    if (!shortList) {
      res.status(400).json({ message: "Failed to add shortlist" });
      return;
    }
    res.status(200).json({ message: "Shortlist added successfully" });
    return;
  } catch (error) {
    ErrorHandler.handle(error, res);
  }
}

const getShortlisted_listing = async (req: Request, res: Response): Promise<void> => {
  const uid = req.uid;
  try {
    const shortListedListing = await ShortListRepository.find({where:{uid}});

    if(shortListedListing.length === 0){
      res.status(400).json({message:"No shortlisted listing found"});
      return;
    }

    const lstIds = shortListedListing.map((listing) => listing.lstId);

    const allListings = await listingRepository.find({where:{lstId:In(lstIds)}})

    if(allListings.length === 0){
      res.status(400).json({message:"Shortlisted listing not found"});
      return;
    }

    res.status(200).json({message:"Shortlisted listing found successfully",
      Total:allListings.length,allListings});
    return;
    
  } catch (error) {
    ErrorHandler.handle(error, res);
  }
}

export { signUp, login, getUser, changePassword, updateUser, addFav, deleteFav, createListing, updateListing, getAllListing, deleteListing,addto_shortlist,getShortlisted_listing };
