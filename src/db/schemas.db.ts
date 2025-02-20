import { AppDataSource } from "./dbConnection.db";

import User from "../models/user.model"; 
import Area from "../models/area.model";
import Listing from "../models/listings.model";
import favList from "../models/favList.model";
import Track from "../models/track.model";
import ShortList from "../models/shortList.model";

const userRepository = AppDataSource.getRepository(User);
const areaRepository = AppDataSource.getRepository(Area);
const listingRepository = AppDataSource.getRepository(Listing);
const favListRepository = AppDataSource.getRepository(favList);
const trackRepository = AppDataSource.getRepository(Track);
const ShortListRepository = AppDataSource.getRepository(ShortList);


export { userRepository, areaRepository, listingRepository, favListRepository, trackRepository,ShortListRepository };
