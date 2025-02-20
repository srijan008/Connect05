import { EntitySchema } from "typeorm";

const ShortList = new EntitySchema({
    name: "ShortList",
    tableName: "ShortList",
    columns: {
        slId: {
            primary: true,
            type: "int",
            generated: true
        },
        lstId:{
            type: "int"
        },
        uid:{
            type: "int"
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

export default ShortList;
