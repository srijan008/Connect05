"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateListings = exports.getListings = void 0;
const schemas_db_1 = require("../db/schemas.db");
const axios_1 = __importDefault(require("axios"));
const errorHandling_1 = __importDefault(require("../utils/errorHandling"));
const API_SOURCES = [
    {
        name: "NoBroker",
        url: (city, locality) => `https://0841-35-227-2-130.ngrok-free.app/nobroker?city=${city}&locality=${locality}&page=1`,
        mapData: (response, city, locality) => response.data && Array.isArray(response.data.data) ? response.data.data.map((item) => ({
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
        url: (city, locality) => `https://0841-35-227-2-130.ngrok-free.app/housing?city=${city}&locality=${locality}&page=1`,
        mapData: (response, city, locality) => response.data && Array.isArray(response.data.data) ? response.data.data.map((item) => ({
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
        url: (city, locality) => `https://0841-35-227-2-130.ngrok-free.app/squareyard?city=${city}&locality=${locality}&page=1`,
        mapData: (response, city, locality) => response.data && Array.isArray(response.data.data) ? response.data.data.map((item) => ({
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
const getListings = async (req, res) => {
    const { city, locality } = req.query;
    if (!city || !locality) {
        res.status(400).json({ error: "City and locality are required" });
        return;
    }
    try {
        const existingListings = await schemas_db_1.listingRepository.find({ where: { city: city, locality: locality } });
        if (existingListings.length > 0) {
            res.json(existingListings);
            return;
        }
        let newListings = [];
        const fetchListings = API_SOURCES.map(async (source) => {
            try {
                const response = await axios_1.default.get(source.url(city, locality));
                return source.mapData(response, city, locality);
            }
            catch (error) {
                console.error(`Error fetching data from ${source.name}:`, error);
                return [];
            }
        });
        const fetchedListings = await Promise.all(fetchListings);
        newListings = fetchedListings.flat();
        if (newListings.length > 0) {
            await schemas_db_1.listingRepository.save(newListings);
        }
        res.json(newListings);
    }
    catch (error) {
        errorHandling_1.default.handle(error, res);
    }
};
exports.getListings = getListings;
const updateListings = async (req, res) => {
    const { city, locality } = req.query;
    if (!city || !locality) {
        res.status(400).json({ error: "City and locality are required" });
        return;
    }
    try {
        await schemas_db_1.listingRepository.delete({ city: city, locality: locality });
        let newListings = [];
        const fetchListings = API_SOURCES.map(async (source) => {
            try {
                const response = await axios_1.default.get(source.url(city, locality));
                return source.mapData(response, city, locality);
            }
            catch (error) {
                console.error(`Error fetching data from ${source.name}:`, error);
                return [];
            }
        });
        const fetchedListings = await Promise.all(fetchListings);
        newListings = fetchedListings.flat();
        if (newListings.length > 0) {
            await schemas_db_1.listingRepository.save(newListings);
        }
        res.json(newListings);
    }
    catch (error) {
        errorHandling_1.default.handle(error, res);
    }
};
exports.updateListings = updateListings;
