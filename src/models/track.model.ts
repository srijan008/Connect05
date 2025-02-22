import { EntitySchema } from "typeorm";

const Track = new EntitySchema({
    name:"Track",
    tableName:"Track",
    columns:{
        tid:{
            primary:true,
            type:"int",
            generated:true
        },
        uid:{
            type:"int"
        },
        area:{
            type:"float"
        },
        isActive:{
            type:"boolean",
            default:true
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

export default Track;