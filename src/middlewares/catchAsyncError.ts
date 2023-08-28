import { NextFunction,Request ,Response} from "express";

const catchAsyncError=(theFunc:Function) =>(req:Request,res:Response,next:NextFunction)=>{
  Promise.resolve(theFunc(req,res,next)).catch(next);
}

export default catchAsyncError;