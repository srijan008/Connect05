// To be fixed .............................

const parsePrice = (priceString: string | undefined | null): number => {
    if (!priceString) return 0; // Handle missing price

    // Extract lower price if it's a range
    let lowerPrice: string = priceString.split("-")[0].trim();

    // Remove currency symbols (₹, spaces, commas)
    lowerPrice = lowerPrice.replace(/₹|,|\s+/g, "").trim();

    if (lowerPrice.includes("Cr")) {
        return parseFloat(lowerPrice.replace("Cr", "").trim()) * 10000000; // Convert Crore to actual number
    }

    if (lowerPrice.includes("L")) {
        return parseFloat(lowerPrice.replace("L", "").trim()) * 100000; // Convert Lakh to actual number
    }

    return parseFloat(lowerPrice) || 0; // Default to 0 if parsing fails
};



export default parsePrice