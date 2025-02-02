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
        tid:{
            type:"int"
        },
        lstId:{
            type:"int"
        }
    }
})

export default FavList;