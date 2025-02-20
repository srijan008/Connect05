import { EntitySchema } from "typeorm";

const FavList = new EntitySchema({
    name:"FavList",
    tableName:"FavList",
    columns:{
        slNo:{
            primary:true,
            type:"int",
            generated:true
        },
        uid:{
            type:"int",
        },
        tid:{
            type:"int",
            nullable:true
        },
        lstId:{
            type:"int"
        }
    }
})

export default FavList;