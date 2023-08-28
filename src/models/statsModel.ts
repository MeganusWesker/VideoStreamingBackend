import mongoose from "mongoose";

export interface IStatsDocument extends mongoose.Document{
    users:number,
    views:number,
    subscriptions:number,
    createdAt?:Date,
} 

const statsSchema =new mongoose.Schema({
    users:{
         type:Number,
         default:0,
    },
    views:{
         type:Number,
         default:0,
    },
    subscriptions:{
         type:Number,
         default:0,
    },
    
    createdAt:{
        type:Date,
        default:Date.now
    }
});

export const Stats =mongoose.model<IStatsDocument>("Stats",statsSchema);