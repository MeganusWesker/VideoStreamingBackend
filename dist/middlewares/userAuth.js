import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/ErrorHandler.js";
import catchAsyncError from "./catchAsyncError.js";
export const isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
    // const {token}:{token?:string} = req.cookies;
    const token = req.cookies.token;
    if (!token) {
        return next(new ErrorHandler('login first to acces this resource', 401));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded._id);
    //   req.hell="i am devil"
    next();
});
export const isAdmin = catchAsyncError(async (req, res, next) => {
    if (req.user.role !== "admin") {
        return next(new ErrorHandler(`Not Authroized ${req.user.role}`, 401));
    }
    next();
});
export const isAutorizedUser = catchAsyncError(async (req, res, next) => {
    if (req.user.role === "admin" || (req.user.subscription && req.user.subscription.status === 'active')) {
        next();
        return;
    }
    return next(new ErrorHandler(`Buy Subscrption To watch`, 401));
});
