import { Request, Response } from "express";
import { listingRepository } from "../db/schemas.db";
import axios from "axios";
import ErrorHandler from "../utils/errorHandling";
import fs from "fs";
import { Not,IsNull } from "typeorm";
import parsePrice from "../utils/priceCompare";

function getRandomInt(a: number, b: number): number {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

interface ListingItem {
    uid?: number | null;
    city: string;
    locality: string;
    name: string;
    address: string;
    link: string;
    price: string;
    perSqftPrice?: string | null;
    emi?: string | null;
    builtUp?: string | null;
    facing?: string | null;
    apartmentType?: string | null;
    bathrooms?: number | null;
    parking?: string | null;
    image: string[];
    latitude: string | null;
    longitude: string | null;
    possessionStatus?: string | null;
    possessionDate?: string | null;
    agentName?: string | null;
    description?: string | null;
    source: string;
}
interface HousingData {
    data: ListingItem[];
}


type SortByType = "createdAt" | "price";
type OrderType = "ASC" | "DESC"| undefined;

const API_SOURCES = [
    { 
        name: "NoBroker",
        url: (city: string, locality: string) => `https://0841-35-227-2-130.ngrok-free.app/nobroker?city=${city}&locality=${locality}&page=1`,
        mapData: (response: any, city: string, locality: string): ListingItem[] => response.data && Array.isArray(response.data.data) ? response.data.data.map((item: any) => ({
            uid: null,
            city,
            locality,
            name: item.name,
            address: item.address,
            link: item.link,
            price: item.price,
            perSqftPrice: item.per_sqft_price,
            emi: item.emi,
            builtUp: item.built_up,
            facing: item.facing || null,
            apartmentType: item.apartment_type || null,
            bathrooms: item.bathrooms || null,
            parking: item.parking || null,
            image: item.image ? [item.image] : [],
            latitude: item.latitude,
            longitude: item.longitude,
            possessionStatus: null,
            possessionDate: null,
            agentName: null,
            description: null,
            source: "NoBroker"
        })) : []
    },
    { 
        name: "Housing",
        url: (city: string, locality: string) => `https://0841-35-227-2-130.ngrok-free.app/housing?city=${city}&locality=${locality}&page=1`,
        mapData: (response: any, city: string, locality: string): ListingItem[] => response.data && Array.isArray(response.data.data) ? response.data.data.map((item: any) => ({
            uid: null,
            city,
            locality,
            name: item.name,
            address: "Unknown",
            link: item.link,
            price: item.price,
            perSqftPrice: item.avg_price || null,
            emi: item.emi_starts || null,
            builtUp: "Unknown",
            facing: null,
            apartmentType: null,
            bathrooms: null,
            parking: null,
            image: item.image ? [item.image] : [],
            latitude: item.latitude,
            longitude: item.longitude,
            possessionStatus: item.possession_status || null,
            possessionDate: item.possession_date || null,
            agentName: null,
            description: null,
            source: "Housing"
        })) : []
    },
    { 
        name: "SquareYard",
        url: (city: string, locality: string) => `https://0841-35-227-2-130.ngrok-free.app/squareyard?city=${city}&locality=${locality}&page=1`,
        mapData: (response: any, city: string, locality: string): ListingItem[] => response.data && Array.isArray(response.data.data) ? response.data.data.map((item: any) => ({
            uid: null,
            city,
            locality,
            name: item.name,
            address: item.location || "Unknown",
            link: item.details_link,
            price: item.price,
            perSqftPrice: null,
            emi: null,
            builtUp: item.built_up_area || "Unknown",
            facing: null,
            apartmentType: null,
            bathrooms: item.bathrooms || null,
            parking: null,
            image: item.image_link ? [item.image_link] : [],
            latitude: item.latitude,
            longitude: item.longitude,
            possessionStatus: item.possession_status || null,
            possessionDate: null,
            agentName: item.agent_name || null,
            description: item.description || null,
            source: "SquareYard"
        })) : []
    }
];

export const getListings = async (req: Request, res: Response): Promise<void> => {
    const { city, locality } = req.query;
    if (!city || !locality) {
        res.status(400).json({ error: "City and locality are required" });
        return;
    }
    try {
        const existingListings = await listingRepository.find({ where: { city: city, locality: locality } });
        if (existingListings.length > 0) {
            res.json(existingListings);
            return;
        }
        let newListings: ListingItem[] = [];
        const fetchListings = API_SOURCES.map(async (source) => {
            try {
                const response = await axios.get(source.url(city as string, locality as string));
                return source.mapData(response, city as string, locality as string);
            } catch (error) {
                console.error(`Error fetching data from ${source.name}:`, error);
                return [];
            }
        });
        const fetchedListings = await Promise.all(fetchListings);
        newListings = fetchedListings.flat();
        if (newListings.length > 0) {
            await listingRepository.save(newListings);
        }
        res.json(newListings);
    } catch (error) {
        ErrorHandler.handle(error, res);
    }
};

export const updateListings = async (req: Request, res: Response): Promise<void> => {
    const { city, locality } = req.query;
    if (!city || !locality) {
        res.status(400).json({ error: "City and locality are required" });
        return;
    }
    try {
        await listingRepository.delete({ city: city, locality: locality });
        let newListings: ListingItem[] = [];
        const fetchListings = API_SOURCES.map(async (source) => {
            try {
                const response = await axios.get(source.url(city as string, locality as string));
                return source.mapData(response, city as string, locality as string);
            } catch (error) {
                console.error(`Error fetching data from ${source.name}:`, error);
                return [];
            }
        });
        const fetchedListings = await Promise.all(fetchListings);
        newListings = fetchedListings.flat();
        if (newListings.length > 0) {
            await listingRepository.save(newListings);
        }
        res.json(newListings);
    } catch (error) {
        ErrorHandler.handle(error, res);
    }
};
export const createListingFromJson = async (req: Request, res: Response): Promise<void> => {
    try {
        const file = req.file;

        if (!file) {
            res.status(400).json({ error: "File not found" });
            return;
        }

        const housingData : HousingData = require(file.path);

        // Assuming listingRepository is already defined and connected to your database
        const housing = await Promise.all(
            housingData.data.map(async (item: ListingItem) => {
                return listingRepository.save(item);
            })
        );
        
        // Delete the file after processing
        fs.unlinkSync(file.path);

      if(housing.length > 0){
        res.json({ message: "Listings added successfully",Total_Listing_added:housing.length});
        return ;}


        res.status(400).json({ error: "Error adding listings" });
        return;

        
    } catch (error) {
        ErrorHandler.handle(error, res);
        return;
    }
};


export const getListings_withselectedfield = async (req: Request, res: Response): Promise<void> => {
    const { city, locality } = req.query;
    
    if (!city || !locality) {
        res.status(400).json({ error: "City and locality are required" });
        return;
    }
    const random: number = getRandomInt(50,150);

    try {
        const existingListings = await listingRepository.find({
            where: {
                city: city,
                locality: locality,
                latitude: Not(IsNull()),
                longitude: Not(IsNull()),
            },
            take: random, // Ensure 'random' is a valid number
        });
        if (existingListings.length > 0) {
            res.status(200).json({messgage:"Listings Found Successfully",total:existingListings.length,listings:existingListings});
            return;
        }
        res.status(400).json({ error: "No data found" });
       return 
    } catch (error) {
        ErrorHandler.handle(error, res);
    }
};

export const getListings_Shortlisted = async (req: Request, res: Response): Promise<void> => {
    const { city, locality } = req.query;

    if (!city || !locality) {
        res.status(400).json({ error: "City and locality are required" });
        return;
    }

   

    try {

        const existingListings = await listingRepository
            .createQueryBuilder("listing")
            .where("listing.city = :city AND listing.locality = :locality", { city, locality })
            .andWhere("listing.longitude IS NOT NULL")
            .andWhere("listing.latitude IS NOT NULL")
            .orderBy("RANDOM()")
            .take(30) // Taking a random number of listings
            .getMany();

            if (existingListings.length > 0) {
                res.status(200).json({messgage:"Listings Found Successfully",total:existingListings.length,listings:existingListings});
                return;
            }
            res.status(400).json({ error: "No data found" });
            return 
    } catch (error) {
        ErrorHandler.handle(error, res);
    }
};

export const getListings_Agent = async (req: Request, res: Response): Promise<void> => {
    const { city, locality } = req.query;

    if (!city || !locality) {
        res.status(400).json({ error: "City and locality are required" });
        return;
    }

 
    try {
        const random: number = getRandomInt(3,10);

        const agentListing = await listingRepository
            .createQueryBuilder("listing")
            .where("listing.city = :city AND listing.locality = :locality", { city, locality })
            .andWhere("listing.longitude IS NOT NULL")
            .andWhere("listing.latitude IS NOT NULL")
            .orderBy("RANDOM()")
            .take(random) // Taking a random number of listings
            .getMany();

            if (agentListing.length > 0) {
                res.status(200).json({messgage:"Listings Found Successfully",total:agentListing.length,listings:agentListing});
                return;
            }
            res.status(400).json({ error: "No data found" });
            return 
    } catch (error) {
        ErrorHandler.handle(error, res);
    }
};


export const getListingById = async (req: Request, res: Response): Promise<void> => {
    const { lstId } = req.params;
    if (!lstId) {
        res.status(400).json({ error: "Id is required" });
        return;
    }
    try {
        const Listing = await listingRepository.find({ where: { lstId}});
        if (Listing.length > 0) {
            res.status(200).json({message:"Listing details found",Listing});
            return;
        }
        
        res.status(401).json("No data found");
        return;
    } catch (error) {
        ErrorHandler.handle(error, res);
    }
};
export const searchInListings = async (req: Request, res: Response): Promise<void> =>{
    try {
        const searchText: string = req.query.searchText as string;
        const sortBy: string = (req.query.sortBy as string) || "createdAt"; // "price" or "createdAt"
        const order:any = req.query.order as string || "DESC";
        const limit: number = parseInt(req.query.limit as string) || 10;
        const page: number = parseInt(req.query.page as string) || 1;

        // Validations
        if (!searchText) {
            res.status(400).json({ error: "Search text is required" });
            return;
        }
        if (searchText.length < 3) {
            res.status(400).json({ message: "Search text length must be at least 3 characters" });
            return;
        }
        if (!["ASC", "DESC"].includes(order)) {
            res.status(400).json({ error: "Order should be either ASC or DESC" });
            return;
        }
        if (limit < 1) {
            res.status(400).json({ error: "Limit should be greater than 0" });
            return;
        }
        if (page < 1) {
            res.status(400).json({ error: "Page should be greater than 0" });
            return;
        }

        const offset: number = (page - 1) * limit;
        let query = listingRepository.createQueryBuilder("listing");

        // Search filter
        query.where(
            "LOWER(listing.name) ILIKE LOWER(:searchText) OR LOWER(listing.locality) ILIKE LOWER(:searchText)",
            { searchText: `%${searchText}%` }
        );

        // Sorting logic
        query.orderBy(`listing.${sortBy}`, order.toUpperCase());
        query.skip(offset).take(limit);

        const listings = await query.getMany();

        if (listings.length === 0) {
            res.status(404).json({ message: "No match found" });
            return;
        }

        res.json({ success: true, count: listings.length, data: listings });
    } catch (error) {
        ErrorHandler.handle(error, res);
    }
};

