import os from "os";
import sharp from "sharp";
import fs from "fs";
import {Express} from "express"
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import dotenv from "dotenv";

dotenv.config();

const compressImage = async (req: any) => {
    try {
        //generating temp directory to store the file temporary
        const tempDir = os.tmpdir();

        const buffer = fs.readFileSync(req.path);
        // changing file name to webp extension
        // const nameArray = originalname.split(".");
        // nameArray[nameArray.length - 1] = ".jpeg";
        // const fileName = nameArray.join("");
        const fileName = Date.now() + ".jpeg";
        const savedPath = `${tempDir}/${fileName}`;

        await sharp(buffer)
            .jpeg({
                quality: 50,
                // chromaSubsampling: '4:4:4'
            })
            .toFile(savedPath);
        // await sharp(buffer).webp({ quality: 20 }).toFile(savedPath);
        return { path: savedPath, originalname: fileName };
    } catch (error) {
        console.log(error);
    }
};



// Configure AWS S3
const s3Client = new S3Client({
    region: "us-west-2",
    endpoint: "https://s3.us-west-2.amazonaws.com",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
});



// Upload function using AWS SDK v3
const uploadToS3 = async (file: Express.Multer.File) => {

   try {
     const compressedFile = await compressImage(file);
 
     if(!compressedFile){
         console.log("Error compressing file");      
         return null;
     }
     const uploadParams = {
         Bucket: process.env.AWS_S3_BUCKET_NAME,
         Key: `user/${Date.now()}-${compressedFile.originalname}`, // Path inside 'user' folder
         Body: fs.createReadStream(compressedFile.path),
         ContentType: "image/jpeg",
     };
     
     const parallelUploads3 = new Upload({
         client: s3Client,
         params: uploadParams,
     });
 
     const uploadResult = await parallelUploads3.done();
     console.log(uploadResult);
     
 
     return uploadResult.Location
 
   } catch (error) {
    console.log({message:`error uploading file ${file.filename}`,error});

    return null

   }
   finally{
    fs.unlinkSync(file.path);
   }
    
};

const deleteFromS3 = async (url: string) => {
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
        const command = new DeleteObjectCommand(deleteParams);
        const result = await s3Client.send(command);

        return result;
    } catch (error) {
        console.error("Error deleting object from S3:", error);
        throw error;
    }
};

export { compressImage,uploadToS3, deleteFromS3 };
