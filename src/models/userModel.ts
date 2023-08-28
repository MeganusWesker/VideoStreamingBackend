import mongoose from "mongoose";
import isEmail from 'validator/lib/isEmail.js';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import validator from "validator";

export interface UserDocument extends mongoose.Document {
   name: string;
   email: string;
   password: string;
   role?: string;
   subscription: {
       id: string | undefined;
       status: string | undefined;
   };
   avatar?: {
       public_id: string;
       url: string;
   };
   playlist?: Array<{
       course: mongoose.Types.ObjectId;
       poster: string;
   }>;
   createdAt?: Date;
   verified?: boolean;
   resetPasswordToken?: string;
   resetPasswordExpire?: string;
   otp?: number;
   otp_expiry?: Date;

   getJwtToken: () => string;
   getResetToken: () => string;
   comparePassword: (password: string) => Promise<boolean>;
 
}

const userSchema = new mongoose.Schema({
     name:{
        type:String,
        required:[true,"Please enter you're name"],
        minlength:[3,"name should be more than of 2 characters"]
     },

      email:{
         type:String,
         required:[true,"please enter you're email"],
         unique:true, 
      },

     password:{
            type:String,
            required:[true,"please enter you're password"],
            minlength:[8,"password should be more than of 7 characters"],
            select:false
     },


     role:{
        type:String,
        default:"user"
     },

     subscription:{
        id:String,
        status:String
     },

     avatar:{
        public_id:{
            type:String,     
        },

        url:{
            type:String,
        }
     },


     playlist:[
        {
            course:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Course"
            },

            poster:String
        }
     ],
     
     createdAt:{
        type:Date,
        default:Date.now
     },


     verified:{
       type:Boolean,
       default:false
     },

     resetPasswordToken:String,
     resetPasswordExpire:String,
     otp:Number,
     otp_expiry:Date

});


userSchema.pre<UserDocument>('save',async function(next){
   if(!this.isModified('password')){
       next();
   }
    this.password = await bcrypt.hash(this.password,10);
    next();
});

userSchema.methods.getJwtToken=function(){
   return jwt.sign({_id:this._id},process.env.JWT_SECRET as string,{expiresIn:process.env.JWT_EXPIRE});
}

userSchema.methods.getResetToken=function(){
   const resetToken =crypto.randomBytes(20).toString('hex');

   this.resetPasswordToken=crypto.createHash('sha256').update(resetToken).digest('hex');
   this.resetPasswordExpire=new Date(Date.now() + 15 * 60 *1000);

   return resetToken;
}

userSchema.methods.comparePassword=async function(password:string){
   return await bcrypt.compare(password,this.password)
}




export const User = mongoose.model<UserDocument>('User', userSchema);