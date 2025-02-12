"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUp = signUp;
exports.login = login;
exports.getUser = getUser;
exports.changePassword = changePassword;
exports.updateUser = updateUser;
exports.addFav = addFav;
exports.deleteFav = deleteFav;
exports.createListing = createListing;
exports.updateListing = updateListing;
exports.getAllListing = getAllListing;
exports.deleteListing = deleteListing;
const schemas_db_1 = require("../db/schemas.db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const errorHandling_1 = __importDefault(require("../utils/errorHandling"));
const zodSchemas_utils_1 = require("../utils/zodSchemas.utils");
const image_utils_1 = require("../utils/image.utils");
const Salt = Number(process.env.SALT) || 10;
const jwtSecret = process.env.JWT_SECRET ?? "secret";
const expiresIn = process.env.JWT_EXPIRES_IN ?? "1h";
async function signUp(req, res) {
    try {
        const { name, email, password, mobile_number } = req.body;
        if (!name || !email || !password || !mobile_number) {
            res.status(400).send("Please enter all fields");
            return;
        }
        const existingUser = await schemas_db_1.userRepository.findOne({ where: { mobile_number } });
        if (existingUser) {
            res.status(409).send("User already exists");
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, Salt);
        const user = await schemas_db_1.userRepository.save({
            name,
            email,
            password: hashedPassword,
            mobile_number,
        });
        if (!user) {
            res.status(500).send("Error in registering user");
            return;
        }
        const token = jsonwebtoken_1.default.sign({ uid: user.uid }, jwtSecret, { expiresIn });
        res.status(201).json({
            message: "User registered successfully",
            token,
        });
    }
    catch (error) {
        console.error("Signup Error:", error);
        res.status(500).send("Internal Server Error");
        return;
    }
}
async function login(req, res) {
    const { mobile_number, password } = req.body;
    if (!mobile_number || !password) {
        res.status(400).send("Please enter all fields");
        return;
    }
    try {
        const user = await schemas_db_1.userRepository.findOne({ where: { mobile_number } });
        if (!user) {
            res.status(404).send("User not found");
            return;
        }
        const isMatch = await bcrypt_1.default.compare(password, user?.password);
        if (!isMatch) {
            res.status(401).send("Invalid Credentials");
            return;
        }
        const token = jsonwebtoken_1.default.sign({ uid: user.uid }, jwtSecret, { expiresIn });
        res.status(200).json({
            message: `${user?.name} logged in successfully`,
            token,
        });
    }
    catch (error) {
        res.status(500).send("Internal Server Error");
        return;
    }
}
async function getUser(req, res) {
    try {
        const user = await schemas_db_1.userRepository.findOne({ where: { uid: req.uid } });
        if (!user) {
            res.status(404).send("User not found");
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error("Get User Error:", error);
        res.status(500).send("Internal Server Error");
        return;
    }
}
async function changePassword(req, res) {
    const { oldPassword, newPassword } = req.body;
    const uid = req.uid;
    if (!oldPassword || !newPassword) {
        res.status(400).send("Please enter all fields");
        return;
    }
    try {
        const user = await schemas_db_1.userRepository.findOne({ where: { uid } });
        const isMatch = await bcrypt_1.default.compare(oldPassword, user?.password);
        if (!isMatch) {
            res.status(401).send("Invalid Credentials");
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(newPassword, Salt);
        const updatedUser = await schemas_db_1.userRepository.update(uid, {
            password: hashedPassword
        });
        if (!updatedUser.affected || updatedUser.affected === 0) {
            res.status(500).send("Error in updating password");
            return;
        }
        res.status(200).send("Password updated successfully");
        return;
    }
    catch (error) {
        console.error("Change Password Error:", error);
        res.status(500).send("Internal Server Error");
        return;
    }
}
async function updateUser(req, res) {
    const { name, email, mobile_number } = req.body;
    if (!name && !email && !mobile_number) {
        res.status(400).send("At least one field is required");
        return;
    }
    const uid = req.uid;
    const file = req.file;
    console.log(uid);
    try {
        const user = await schemas_db_1.userRepository.findOne({ where: { uid } });
        if (!user) {
            res.status(404).send("User not found");
            return;
        }
        if (file) {
            const uploadResult = await (0, image_utils_1.uploadToS3)(file);
            if (uploadResult) {
                user.profilePhoto = uploadResult;
            }
        }
        const updatedUser = await schemas_db_1.userRepository.update(uid, {
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
    }
    catch (error) {
        console.error("Update User Error:", error);
        res.status(500).send("Internal Server Error");
        return;
    }
}
async function createListing(req, res) {
    try {
        const listingData = zodSchemas_utils_1.ListingSchema.parse(req.body);
        const files = req.files?.photo;
        const listing = await schemas_db_1.listingRepository.save({ ...listingData });
        if (!listing) {
            res.status(400).json({ message: "Failed to add listing" });
            return;
        }
        if (files && files?.length > 0) {
            if (!listing.image) {
                listing.image = [];
            }
            const uploadToAws = files.map(async (file) => {
                try {
                    const uploadResult = await (0, image_utils_1.uploadToS3)(file);
                    if (uploadResult && uploadResult !== null) {
                        listing.image?.push(uploadResult);
                    }
                }
                catch (error) {
                    console.error(`Error uploading file ${file.filename}:`, error);
                }
            });
            await Promise.all(uploadToAws);
        }
        const savedListing = await schemas_db_1.listingRepository.save(listing);
        if (!savedListing) {
            res.status(400).json({ message: "Failed to add listing" });
            return;
        }
        res.status(200).json({ message: "Listing added successfully", listing: savedListing });
        return;
    }
    catch (error) {
        errorHandling_1.default.handle(error, res);
    }
}
async function updateListing(req, res) {
    try {
        const lstId = Number(req.params.lstId);
        const files = req.files?.photo;
        const updatedListingData = req.body;
        if (Object.keys(updatedListingData).length === 0) {
            res.status(400).json({ message: "Please provide data to update" });
            return;
        }
        const listing = await schemas_db_1.listingRepository.findOne({ where: { lstId } });
        if (!listing) {
            res.status(400).json({ message: "Listing not found" });
            return;
        }
        Object.keys(updatedListingData).forEach((key) => {
            if (updatedListingData[key] === "")
                updatedListingData[key] = null;
        });
        Object.assign(listing, updatedListingData);
        if (files && files?.length > 0) {
            if (!listing.image) {
                listing.image = [];
            }
            const uploadToAws = files.map(async (file) => {
                try {
                    const uploadResult = await (0, image_utils_1.uploadToS3)(file);
                    if (uploadResult && uploadResult !== null) {
                        listing.image?.push(uploadResult);
                    }
                }
                catch (error) {
                    console.error(`Error uploading file ${file.filename}:`, error);
                }
            });
            await Promise.all(uploadToAws);
        }
        const updatedListing = await schemas_db_1.listingRepository.save(listing);
        if (!updatedListing) {
            res.status(400).json({ message: "Failed to update listing" });
            return;
        }
        res.status(200).json({ message: "Listing updated successfully", listing: updatedListing });
        return;
    }
    catch (error) {
        errorHandling_1.default.handle(error, res);
    }
}
async function getAllListing(req, res) {
    try {
        const allListings = await schemas_db_1.listingRepository.find();
        if (allListings.length === 0) {
            res.status(400).json({ message: "No listing found" });
            return;
        }
        res.status(200).json({ message: "Listings Found successfully", allListings });
    }
    catch (error) {
        errorHandling_1.default.handle(error, res);
    }
}
async function deleteListing(req, res) {
    try {
        const lstId = req.params.lstId;
        const deleteFav = await schemas_db_1.favListRepository.delete({ lstId });
        const deleteListing = await schemas_db_1.listingRepository.delete({ lstId });
        if (deleteListing.affected === 0) {
            res.status(400).json({ message: "Unable to delete the listing" });
            return;
        }
        res.status(200).json({ message: "Listing deleted successfully" });
    }
    catch (error) {
        errorHandling_1.default.handle(error, res);
    }
}
async function addFav(req, res) {
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
        const fav = await schemas_db_1.favListRepository.save(favData);
        if (!fav) {
            res.status(400).json({ message: "Failed to add fav" });
            return;
        }
        res.status(200).json({ message: "Fav added successfully" });
        return;
    }
    catch (error) {
        errorHandling_1.default.handle(error, res);
    }
}
async function deleteFav(req, res) {
    try {
        const uid = req.uid;
        const { slNo } = req.params;
        const deleteFav = await schemas_db_1.favListRepository.delete({ slNo, uid });
        if (deleteFav.affected === 0) {
            res.status(400).json({ message: "Failed to delete fav" });
            return;
        }
        res.status(200).json({ message: "Fav deleted successfully" });
        return;
    }
    catch (error) {
        errorHandling_1.default.handle(error, res);
    }
}
