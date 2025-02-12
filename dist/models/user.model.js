"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const typeorm_1 = require("typeorm");
exports.User = new typeorm_1.EntitySchema({
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
            enum: ["active", "inactive"]
        },
        profilePhoto: {
            type: "varchar",
            nullable: true
        }
    }
});
exports.default = exports.User;
