import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import User from "../models/user.model";
import Area from "../models/area.model";
import FavList from "../models/favList.model";
import Listing from "../models/listings.model";
import Track from "../models/track.model";
import Waitlist from "../models/waitlist.model"; 

dotenv.config();

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [User, Area, FavList, Listing, Track, Waitlist],
  synchronize: process.env.DBSYNC === "true",
  logging: process.env.DBSYNC === "true",
});

AppDataSource.initialize()
  .then(() => {
    console.log("Database Connected!");
    if (process.env.DBSYNC === "true") {
      console.log("Sync Completed...");
      console.log("Shutting Down...");
      process.exit();
    }
  })
  .catch((error) => console.log("Database connection error:", error));

export { AppDataSource };
