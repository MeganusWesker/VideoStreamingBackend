import { Request, NextFunction, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler.js";
import catchAsyncErrors from "../middlewares/catchAsyncError.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import { User } from "../models/userModel.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary";
import { UserDocument } from "../models/userModel.js";
import { IGetUserAuthInfoRequest } from "../middlewares/userAuth.js";
import { Course, ICourseSchemaDocument } from "../models/courseModel.js";

type userType = {
  name?: string | undefined;
  email: string | undefined;
  password: string | undefined;
};

export const register = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body as userType;
    const file: Express.Multer.File | undefined = req.file;

    if (!name || !email || !password) {
      return next(new ErrorHandler("please enter all fields ", 400));
    }

    interface CloudinaryResponse {
      public_id: string;
      secure_url: string;
    }

    let myCloud: CloudinaryResponse | undefined = undefined;

    if (file) {
      const fileUrl = getDataUri(file);

      myCloud = await cloudinary.v2.uploader.upload(fileUrl.content as string, {
        folder: "avatars",
      });
    }

    const otp = Math.floor(Math.random() * 10000000);

    const subject = `confirm you're otp`;

    const text = `hey this is you're otp ${otp} valid for 5 mintues please verify ignore if you did'nt registerd or requested`;

    await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: myCloud ? myCloud.public_id : null,
        url: myCloud ? myCloud.secure_url : null,
      },
      otp,
      otp_expiry: new Date(
        Date.now() + Number(process.env.OTP_EXPIRE) * 60 * 1000
      ),
    });

    try {
      await sendEmail(email, subject, text);
    } catch (error) {
      console.log(error);
      if (error instanceof ErrorHandler) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "otp sent please verify you're email",
    });
  }
);

export const verify = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const otp: number = Number(req.body.otp);
    const email: string = req.body.email;

    if (!email) {
      return next(new ErrorHandler("please enter you're email ", 400));
    }

    const user: UserDocument | null = await User.findOne({ email });

    if (!user) {
      return next(new ErrorHandler("no user find with given email ", 400));
    }

    if (otp !== user.otp || (user.otp_expiry as Date) < new Date()) {
      return next(new ErrorHandler("invalid otp or expired otp", 400));
    }

    user.verified = true;
    user.otp = undefined;
    user.otp_expiry = undefined;

    await user.save();

    sendToken(res, user, 200, "account verified");
  }
);

export const login = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body as userType;

    const user = await User.findOne({ email }).select("+password");

    if (!password || !email)
      return next(new ErrorHandler("please enter all fields", 403));

    if (!user) {
      return next(new ErrorHandler("user not found please register", 404));
    }

    const isMatched = await user.comparePassword(password);

    if (!isMatched) {
      return next(new ErrorHandler("invalid credentials", 403));
    }

    if (!user.verified) {
      return next(new ErrorHandler("please verify you're email", 403));
    }

    sendToken(res, user, 200, "loged in successfullly");
  }
);

export const logout = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    res.cookie('token', null, {
      expires: new Date(Date.now()),
      httpOnly: process.env.NODE_ENV === "Development" ? false : true,
      secure: process.env.NODE_ENV === "Development" ? false : true,
      sameSite: process.env.NODE_ENV === "Development" ? false : "none",
  });

    res.status(200).json({
      success: true,
      message: "loged out sucessfully",
    });
  }
);

export const updateProfile = catchAsyncErrors(
  async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const { email, name }: { email: string; name: string } = req.body;


    console.log(name,email);
    const file = req.file as Express.Multer.File;

    console.log(file);
    const user = (await User.findById(req.user._id)) as UserDocument;

    if (name) {
      user.name = name;
    }

    if (file) {
      const fileUrl = getDataUri(file);
      const myCloud = await cloudinary.v2.uploader.upload(
        fileUrl.content as string,
        {
          folder: "avatars",
        }
      );

      console.log(myCloud);

      if (user.avatar !== undefined && user.avatar.public_id!==null){
          console.log("hena bhai")
          await cloudinary.v2.uploader.destroy(user.avatar.public_id);
      }
       

      user.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };

      console.log("ho ri hai kya ?")
    }

    let emailChangedMessage = "";

    if (email) {
      user.email = email;
      user.verified = false;

      const otp = Math.floor(Math.random() * 10000000);

      user.otp = otp;
      user.otp_expiry = new Date(
        Date.now() + Number(process.env.OTP_EXPIRE) * 60 * 1000
      );

      const subject = `confirm you're otp`;
      const text = `hey this is you're otp ${otp} valid for 5 mintues please verify ignore if you did'nt registerd or requested`;

      try {
        await sendEmail(email, subject, text);
      } catch (error) {
        if(error instanceof ErrorHandler)
            return res.status(400).json({
                success: false,
                message: error.message,
            });
      }

      emailChangedMessage = `please verify you're email`;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `profile updated successfully ${emailChangedMessage}`,
    });
  }
);

export const changePassword = catchAsyncErrors(
  async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const {
      oldPassword,
      newPassword,
      confirmPassword,
    }: {
      oldPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return next(new ErrorHandler("please enter all required fields", 400));
    }

    const user: UserDocument = await User.findById(req.user._id).select(
      "+password"
    );

    const isMatched = await user.comparePassword(oldPassword);

    if (!isMatched) {
      return next(new ErrorHandler(" old password dosen't matched", 403));
    }

    if (newPassword !== confirmPassword) {
      return next(
        new ErrorHandler(
          " confirm password dosen't matched with you're new password ",
          403
        )
      );
    }

    user.password = newPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "password changes successfully",
    });
  }
);

export const forgotPassword = catchAsyncErrors(async (req:Request, res:Response, next:NextFunction) => {

    const { email }:{email:string} = req.body;

    const user = await User.findOne({ email }) as UserDocument;

    if (!user) {
        return next(new ErrorHandler("user not found with this email", 404));
    }

    const otp = Math.floor(Math.random() * 10000000);

    const subject = `you're otp for password reset`;

    const text = `hey this is you're otp ${otp} valid for 5 mintues please verify ignore if you did'nt registerd or requested`;

    user.otp = otp;
    user.otp_expiry = new Date(Date.now() + Number(process.env.OTP_EXPIRE) * 60 * 1000);

    await user.save({ validateBeforeSave: false });

    try {

        await sendEmail(email,subject,text);

        res.status(200).json({
            success: true,
            message: `email sent to ${user.email} succesfully`
        })


    } catch (error) {
        user.otp = undefined;
        user.otp_expiry = undefined;

        await user.save({ validateBeforeSave: false });


        if(error instanceof ErrorHandler)
           return next(new ErrorHandler(error.message, 500));
    }

});

// reseting password
export const resetPassword = catchAsyncErrors(async (req:Request, res:Response, next:NextFunction) => {
    const { otp }:{otp:string} = req.body;

    Number(otp);

    const user = await User.findOne({
        otp,
        otp_expiry: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorHandler("reset password otp is invalid or has been expired", 404));
    }

    const { confirmPassword, password }:{confirmPassword:string,password:string} = req.body;

    if (password !== confirmPassword) {
        return next(new ErrorHandler(" confimr password dosen't matched with you're new password ", 403));
    }

    user.password = password;
    user.otp = undefined;
    user.otp_expiry = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: "password rested successfully"
    });
});


export const addToPlayList=catchAsyncErrors(async (req:IGetUserAuthInfoRequest,res:Response,next:NextFunction)=>{

    const user = await User.findById(req.user._id) as UserDocument;

    if(!req.body.id){
        return next(new ErrorHandler("please enter course id",400));
    }

    const course =await Course.findById(req.body.id) as ICourseSchemaDocument;
    if(!course){
        return next(new ErrorHandler("course not found ",404));
    }

    let itemExist=false;

    if(user.playlist!==undefined)
      for(let i=0; i<user.playlist.length; i++){
          if(req.body.id===user.playlist[i].course.toString()){
              itemExist=true;
          }
      }

    if(itemExist){
        return next(new ErrorHandler("course already in you're playlist ",409));
    }
    if(user.playlist!==undefined)
      user.playlist.push({
          course:course._id,
          poster:course.poster.url
      });

    await user.save();

    res.status(200).json({
        success:true,
        message:"course added successfully"
    })
});

export const removeFromPlaylist =catchAsyncErrors(async (req:IGetUserAuthInfoRequest,res:Response,next:NextFunction)=>{
    const user = await User.findById(req.user._id) as UserDocument;

    const course =await Course.findById(req.query.id) as ICourseSchemaDocument; //?= query

    if(!course){
       return next(new ErrorHandler("course not found ",404));
    }

       let courseIndex;

   if(user.playlist!==undefined)    
      for(let i=0; i<user.playlist.length; i++){
        // console.log(user.playlist[i].course); it will create this result new ObjectId("6332a3e5e9086ad54b3de1ff");
        // so we have to get the id from this object so this could be done by toString method ;console.log(user.playlist[i].course.toString()); result 6332a3e5e9086ad54b3de1ff

          if(req.query.id===user.playlist[i].course.toString()){
              courseIndex=i;
              user.playlist.splice(courseIndex,1);
              await user.save();
              return  res.status(200).json({
                  success:true,
                  message:"course removed successfully"
              });
          }
      }

     res.status(200).json({
        success:false,
        message:"no course found in you're playlist"
    });
});

export const getAllUsers=catchAsyncErrors(async(req:Request,res:Response,next:NextFunction)=>{

    const users:Array<UserDocument>=await User.find();

    res.status(200).json({
        success:true,
        users
    });
});

export const deleteUser =catchAsyncErrors(async (req:Request,res:Response,next:NextFunction)=>{

    const user=await User.findById(req.query.id) as UserDocument;

    if(!user){
        return next(new ErrorHandler("user not found",404));
    }

 
    if(user.avatar!==undefined && user.avatar.public_id!==null)
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    await User.deleteOne({_id:req.query.id});

    res.status(200).json({
        success:true,
        message:"user deleted successfully"
    });
});

export const updateUser =catchAsyncErrors(async(req:Request,res:Response,next:NextFunction)=>{
    const user=await User.findById(req.params.id) as UserDocument;

    if(!user){
        return next(new ErrorHandler("user not found",404));
    }

    if(user.role==="user"){
       user.role="admin";
    }else{
        user.role="user";
    }

    await user.save();

    res.status(200).json({
        success:true,
        message:"user updated successfully"
    });

});

export const getMyProfile =catchAsyncErrors(async(req:IGetUserAuthInfoRequest,res:Response,next:NextFunction)=>{

    const user =await User.findById(req.user._id) as UserDocument;

    res.status(200).json({
        success:true,
        user
    });
});

export const deleteMyProfile=catchAsyncErrors(async(req:IGetUserAuthInfoRequest,res:Response,next:NextFunction)=>{

    const user =await User.findById(req.user._id) as UserDocument;

    if(user?.avatar && user.avatar.public_id!==null)
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);

        await User.deleteOne({_id:req.user._id});

    res.status(200).cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly: process.env.NODE_ENV === "Development" ? false : true,
        secure: process.env.NODE_ENV === "Development" ? false : true,
        sameSite: process.env.NODE_ENV === "Development" ? false : "none",
    }).json({
        success:true,
        message:"user deleted successfully"
    });
});
