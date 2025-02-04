import { EntitySchema } from "typeorm";

const Listing = new EntitySchema({
    name: "Listing",
    tableName: "Listing",
    columns: {
        lstId: {
            primary: true,
            type: "int",
            generated: true
        },
        uid: {
            type: "int"
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
            type: "varchar"
        },
        emi: {
            type: "varchar"
        },
        builtUp: {
            type: "varchar"
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
            nullable: true,
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

export default Listing;
