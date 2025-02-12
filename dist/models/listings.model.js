"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const Listing = new typeorm_1.EntitySchema({
    name: "Listing",
    tableName: "Listing",
    columns: {
        lstId: {
            primary: true,
            type: "int",
            generated: true
        },
        city: {
            type: "varchar"
        },
        locality: {
            type: "varchar"
        },
        name: {
            type: "varchar"
        },
        address: {
            type: "text"
        },
        link: {
            type: "text"
        },
        price: {
            type: "varchar"
        },
        perSqftPrice: {
            type: "varchar",
            nullable: true
        },
        emi: {
            type: "varchar",
            nullable: true
        },
        builtUp: {
            type: "varchar",
            nullable: true
        },
        facing: {
            type: "varchar",
            nullable: true
        },
        apartmentType: {
            type: "varchar",
            nullable: true
        },
        bathrooms: {
            type: "int",
            nullable: true
        },
        parking: {
            type: "varchar",
            nullable: true
        },
        image: {
            type: "simple-array",
            nullable: true
        },
        latitude: {
            type: "varchar",
            nullable: true
        },
        longitude: {
            type: "varchar",
            nullable: true
        },
        possessionStatus: {
            type: "varchar",
            nullable: true
        },
        possessionDate: {
            type: "varchar",
            nullable: true
        },
        agentName: {
            type: "varchar",
            nullable: true
        },
        description: {
            type: "text",
            nullable: true
        },
        source: {
            type: "varchar"
        },
        createdAt: {
            type: "timestamp",
            createDate: true
        },
        updatedAt: {
            type: "timestamp",
            updateDate: true
        }
    }
});
exports.default = Listing;
