export type User = {
    uid: number;
    name: string;
    email: string;
    password: string;
    mobile_number: string;
}

export type track = {
    uid:number;
    area:number;
    isActive:boolean;
}

export interface Track extends track {
    tid: number;
    createdAt: Date;
    updatedAt: Date;
}

 