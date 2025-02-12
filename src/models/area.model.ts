import {EntitySchema} from "typeorm";

const Area = new EntitySchema({
    name:"Area",
    tableName:"Area",
    columns:{
        slNo:{
            primary:true,
            type:"int",
            generated:true
        },
        tid:{
            type:"int"
        },
        lat:{
            type:"float"
        },
        lon:{
            type:"float"
        },

    }
});

export default Area;