"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const user_model_1 = __importDefault(require("../models/user.model"));
const area_model_1 = __importDefault(require("../models/area.model"));
const favList_model_1 = __importDefault(require("../models/favList.model"));
const listings_model_1 = __importDefault(require("../models/listings.model"));
const track_model_1 = __importDefault(require("../models/track.model"));
const AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [user_model_1.default, area_model_1.default, favList_model_1.default, listings_model_1.default, track_model_1.default],
    // synchronize: true,
    synchronize: process.env.DBSYNC === "true",
    logging: process.env.DBSYNC === "true",
});
exports.AppDataSource = AppDataSource;
AppDataSource.initialize()
    .then(() => {
    console.log("Database Connected!");
    if (process.env.DBSYNC === "true") {
        console.log("Sync Completed...");
        console.log("Shuting Down...");
        process.exit();
    }
    // here you can start to work with your database
})
    .catch((error) => console.log(error));
