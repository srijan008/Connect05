"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const FavList = new typeorm_1.EntitySchema({
    name: "FavList",
    tableName: "FavList",
    columns: {
        slNo: {
            primary: true,
            type: "int",
            generated: true
        },
        uid: {
            type: "int",
        },
        tid: {
            type: "int",
            nullable: true
        },
        lstId: {
            type: "int"
        }
    }
});
exports.default = FavList;
