import { EntitySchema } from "typeorm";

const Counter = new EntitySchema({
    name: "Counter",
    tableName: "counter",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        value: {
            type: "int",
            default: 1800
        },
        updatedAt: {
            type: "timestamp",
            updateDate: true
        }
    }
});

export default Counter;