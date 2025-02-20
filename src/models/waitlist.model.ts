import { EntitySchema } from "typeorm";

const Waitlist = new EntitySchema({
    name: "Waitlist",
    tableName: "waitlist",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        name: {
            type: "varchar",
            length: 255
        },
        email: {
            type: "varchar",
            length: 255,
            unique: true
        },
        createdAt: {
            type: "timestamp",
            createDate: true
        }
    }
});

export default Waitlist;
