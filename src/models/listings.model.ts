import { EntitySchema } from "typeorm";

const Listing = new EntitySchema({
    name:"Listing",
    tableName:"Listing",
    columns:{
        lstId:{
            primary:true,
            type:"int",
            generated:true
        },
        uid:{
            type:"int"
        },
        createdAt:{
            type:"timestamp",
            createDate:true
        },
        updatedAt:{
            type:"timestamp",
            updateDate:true
        }
    }
})

export default Listing;