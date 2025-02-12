"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromS3 = exports.uploadToS3 = exports.compressImage = void 0;
const os_1 = __importDefault(require("os"));
const sharp_1 = __importDefault(require("sharp"));
const fs_1 = __importDefault(require("fs"));
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const compressImage = async (req) => {
    try {
        //generating temp directory to store the file temporary
        const tempDir = os_1.default.tmpdir();
        const buffer = fs_1.default.readFileSync(req.path);
        // changing file name to webp extension
        // const nameArray = originalname.split(".");
        // nameArray[nameArray.length - 1] = ".jpeg";
        // const fileName = nameArray.join("");
        const fileName = Date.now() + ".jpeg";
        const savedPath = `${tempDir}/${fileName}`;
        await (0, sharp_1.default)(buffer)
            .jpeg({
            quality: 50,
            // chromaSubsampling: '4:4:4'
        })
            .toFile(savedPath);
        // await sharp(buffer).webp({ quality: 20 }).toFile(savedPath);
        return { path: savedPath, originalname: fileName };
    }
    catch (error) {
        console.log(error);
    }
};
exports.compressImage = compressImage;
// Configure AWS S3
const s3Client = new client_s3_1.S3Client({
    region: "us-west-2",
    endpoint: "https://s3.us-west-2.amazonaws.com",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
// Upload function using AWS SDK v3
const uploadToS3 = async (file) => {
    try {
        const compressedFile = await compressImage(file);
        if (!compressedFile) {
            console.log("Error compressing file");
            return null;
        }
        const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `user/${Date.now()}-${compressedFile.originalname}`, // Path inside 'user' folder
            Body: fs_1.default.createReadStream(compressedFile.path),
            ContentType: "image/jpeg",
        };
        const parallelUploads3 = new lib_storage_1.Upload({
            client: s3Client,
            params: uploadParams,
        });
        const uploadResult = await parallelUploads3.done();
        console.log(uploadResult);
        return uploadResult.Location;
    }
    catch (error) {
        console.log({ message: `error uploading file ${file.filename}`, error });
        return null;
    }
    finally {
        fs_1.default.unlinkSync(file.path);
    }
};
exports.uploadToS3 = uploadToS3;
const deleteFromS3 = async (url) => {
    try {
        // Extract bucket name and key from the URL
        const bucketName = process.env.AWS_S3_BUCKET_NAME;
        const urlObj = new URL(url);
        if (!urlObj.pathname.startsWith("/")) {
            throw new Error("Invalid S3 URL format");
        }
        const objectKey = urlObj.pathname.slice(1); // Remove leading slash
        // Configure the delete parameters
        const deleteParams = {
            Bucket: bucketName,
            Key: objectKey,
        };
        // Send the delete request
        const command = new client_s3_1.DeleteObjectCommand(deleteParams);
        const result = await s3Client.send(command);
        return result;
    }
    catch (error) {
        console.error("Error deleting object from S3:", error);
        throw error;
    }
};
exports.deleteFromS3 = deleteFromS3;
