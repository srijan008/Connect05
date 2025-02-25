import { Request, Response } from "express";
import { listingRepository } from "../db/schemas.db";
import axios from "axios";
import ErrorHandler from "../utils/errorHandling";
import fs from "fs";


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
    try {
        const existingListings = await listingRepository.find({ where: { city: city, locality: locality },select:{
            lstId:true,
            price:true,
            name:true,
            description:true,
            image:true,
            facing:true,
            builtUp:true,
            emi:true,
            perSqftPrice:true,
            parking:true,
            
            latitude:true,
            longitude:true,
        },take:40 });
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

    function getRandomInt(a: number, b: number): number {
        return Math.floor(Math.random() * (b - a + 1)) + a;
    }

    try {
        const random: number = getRandomInt(7, 45);

        const existingListings = await listingRepository
            .createQueryBuilder("listing")
            .where("listing.city = :city AND listing.locality = :locality", { city, locality })
            .select([
                "listing.lstId",
                "listing.price",
                "listing.name",
                "listing.description",
                "listing.image",
                "listing.facing",
                "listing.builtUp",
                "listing.emi",
                "listing.perSqftPrice",
                "listing.parking",
                "listing.latitude",
                "listing.longitude",
            ])
            .orderBy("RANDOM()")
            .take(random) // Taking a random number of listings
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
