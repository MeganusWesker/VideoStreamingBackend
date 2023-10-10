import { Response,Request,NextFunction, RequestHandler } from "express";
import { User, UserDocument } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/ErrorHandler.js";
import catchAsyncError from "./catchAsyncError.js";

interface payload{
    _id:string
}

export interface IGetUserAuthInfoRequest extends Request {
    user: UserDocument,
   // hell?:string // or any other type just eg to show that we can assign varibales how much we want
  }

export const isAuthenticatedUser = catchAsyncError(async (req:IGetUserAuthInfoRequest,res:Response,next:NextFunction)=>{
  // const {token}:{token?:string} = req.cookies;
   const token = req.cookies.token as string;

   
      if(!token){
     
          return next(new ErrorHandler('login first to acces this resource',401))
      }

      const decoded = jwt.verify(token ,process.env.JWT_SECRET as string) as payload;
      req.user = await User.findById(decoded._id) as UserDocument;
    //   req.hell="i am devil"
    
      next();
});

 export const isAdmin=catchAsyncError(async(req:IGetUserAuthInfoRequest,res:Response,next:NextFunction)=>{
    if(req.user.role!=="admin"){
      return next(new ErrorHandler(`Not Authroized ${req.user.role}`,401));
    }
    next();
 })

 export const isAutorizedUser=catchAsyncError(async(req:IGetUserAuthInfoRequest,res:Response,next:NextFunction)=>{
    if(req.user.role==="admin" || (req.user.subscription && req.user.subscription.status==='active')){
       next();
       return;
    }

    return next(new ErrorHandler(`Buy Subscrption To watch`,401));
})

