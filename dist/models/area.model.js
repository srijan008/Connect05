"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const Area = new typeorm_1.EntitySchema({
    name: "Area",
    tableName: "Area",
    columns: {
        slNo: {
            primary: true,
            type: "int",
            generated: true
        },
        tid: {
            type: "int"
        },
        lat: {
            type: "float"
        },
        lon: {
            type: "float"
        },
    }
});
exports.default = Area;
