"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingSchema = void 0;
const zod_1 = require("zod");
const ListingSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Listing name is required"),
    address: zod_1.z.string().min(1, "Address is required"),
    link: zod_1.z.string().url("Invalid URL format"),
    price: zod_1.z.string().min(1, "Price is required"),
    perSqftPrice: zod_1.z.string().min(1, "Price per square foot is required"),
    emi: zod_1.z.string().min(1, "EMI information is required"),
    builtUp: zod_1.z.string().min(1, "Built-up area is required"),
    facing: zod_1.z.string().optional(),
    apartmentType: zod_1.z.string().optional(),
    bathrooms: zod_1.z.number().int().min(0, "Bathrooms count cannot be negative").optional(),
    parking: zod_1.z.string().optional(),
    image: zod_1.z.array(zod_1.z.string().url("Invalid image URL format")).optional(),
});
exports.ListingSchema = ListingSchema;
