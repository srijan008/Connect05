"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const Track = new typeorm_1.EntitySchema({
    name: "Track",
    tableName: "Track",
    columns: {
        tid: {
            primary: true,
            type: "int",
            generated: true
        },
        uid: {
            type: "int"
        },
        area: {
            type: "float"
        },
        isActive: {
            type: "boolean",
            default: true
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
exports.default = Track;
