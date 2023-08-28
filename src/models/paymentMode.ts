import mongoose from "mongoose";


export interface IPaymentDocument extends mongoose.Document {
    razorpay_payment_id:string,
    razorpay_signature:string,
    razorpay_subscription_id:String,
    createdAt:Date,

}

const paymentSchema =new mongoose.Schema({
    razorpay_payment_id:{
        type:String,
        required:true,
    },
    razorpay_signature:{
        type:String,
        required:true,
    },
    razorpay_subscription_id:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

export const Payment =mongoose.model<IPaymentDocument>("Payment",paymentSchema);