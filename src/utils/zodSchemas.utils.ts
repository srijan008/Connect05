import {z} from "zod";



const ListingSchema = z.object({
    name: z.string().min(1, "Listing name is required"),
    address: z.string().min(1, "Address is required"),
    link: z.string().url("Invalid URL format"),
    price: z.string().min(1, "Price is required"),
    perSqftPrice: z.string().min(1, "Price per square foot is required"),
    emi: z.string().min(1, "EMI information is required"),
    builtUp: z.string().min(1, "Built-up area is required"),
    facing: z.string().optional(),
    apartmentType: z.string().optional(),
    bathrooms: z.number().int().min(0, "Bathrooms count cannot be negative").optional(),
    parking: z.string().optional(),
    image: z.array(z.string().url("Invalid image URL format")).optional(),
  });

  export {ListingSchema};
  