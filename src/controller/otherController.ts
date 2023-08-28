import catchAsyncErrors from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import {sendEmail} from "../utils/sendEmail.js";
import { Stats,IStatsDocument } from "../models/statsModel.js";
import { Response,Request,NextFunction } from "express";

export const getDashboardStats=catchAsyncErrors(async(req:Request,res:Response,next:NextFunction)=>{

    const stats=await Stats.find({}).sort({createdAt:"desc"}).limit(12) as Array<IStatsDocument>;


    const statsData:Array<IStatsDocument>=[];


    for(let i=0; i<stats.length; i++){
        statsData.unshift(stats[i]);
    }

    const requiredSize:number= 12-stats.length;

    for(let i=0; i<requiredSize; i++){
        statsData.unshift(new Stats({
            views:0,
            users:0,
            subscriptions:0,
        }));
    }

 

    const userCount:number=statsData[11].users;
    const subscriptionsCount:number=statsData[11].subscriptions;
    const viewsCount:number=statsData[11].views;


    let userProfit:boolean=true,
        viewsProfit:boolean=true,
        subscriptionsProfit:boolean=true;

    let userPercentage:number=0,
        viewsPercentage:number=0,
        subscriptionsPercentage:number=0;

     
   
    if(statsData[10].users===0){
        userPercentage=userCount*100
    }
    if(statsData[10].subscriptions===0){
        subscriptionsPercentage=subscriptionsCount*100
    }
    if(statsData[10].views===0){
        viewsPercentage=viewsCount*100
    }
    else{
       const differnce={
          users:userCount-statsData[10].users,
          subscriptions:subscriptionsCount-statsData[10].subscriptions,
          views:viewsCount-statsData[10].views
       }
       
       userPercentage=(differnce.users/statsData[10].users)*100
       subscriptionsPercentage=(differnce.subscriptions/statsData[10].subscriptions)*100
       viewsPercentage=(differnce.views/statsData[10].views)*100

       if(userPercentage<0){
        userProfit=false;
       }

       if(subscriptionsPercentage<0){
        subscriptionsProfit=false;
       }

       if(viewsPercentage<0){
        viewsProfit=false;
       }
   
    }

    res.status(201).json({
        success:true,
        stats:statsData,
        userProfit,
        viewsProfit,
        subscriptionsProfit,
        userPercentage,
        viewsPercentage,
        subscriptionsPercentage,
        userCount,
        subscriptionsCount,
        viewsCount

    })

});