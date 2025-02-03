import { EntitySchema } from "typeorm";

export const User = new EntitySchema({
    name: "User",
    tableName: "user",
    columns: {
        uid: {
            primary: true,
            type: "int",
            generated: true
        },
        name: {
            type: "varchar"
        },
        email: {
            type: "varchar"
        },
        password: {
            type: "varchar"
        },
        mobile_number: {
            type: "varchar",
            unique: true
        },
        createdAt: {
            type: "timestamp",
            createDate: true
        },
        updatedAt: {
            type: "timestamp",
            updateDate: true
        },
        status: {
            type: "varchar",
            default: "active",
            enum:["active", "inactive"]
        },
        profilePhoto: {
            type: "varchar",
            nullable: true
        }
    }})

export default User;


