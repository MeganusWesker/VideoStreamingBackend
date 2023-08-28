import express from "express";
import {config} from "dotenv";
import errorMidleware from "./middlewares/error.js";
import cookiParser from "cookie-parser";
import cors from "cors";
import { Request,Response } from "express";

const app=express();

// dotenv importing here 
if(process.env.NODE_ENV!=="Production"){
   config();
}


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookiParser());


app.use(
   cors({
    origin:[process.env.FRONTEND_URL1 as string,process.env.FRONTEND_URL2 as string],
    credentials:true,
    methods: ["GET", "POST", "PUT", "DELETE"],
   })
);



// importing all routes here 
import user from "./routes/userRoutes.js"
import course from "./routes/courseRoute.js"
import payment from "./routes/paymentRoute.js"
import other from "./routes/otherRoute.js"


// using all routes here
app.use('/api/v1',user);
app.use('/api/v1/course',course);
app.use('/api/v1/payment',payment);
app.use('/api/v1',other);


app.get('/',(req:Request,res:Response)=>{
   res.send("working")
})


export default app;
app.use(errorMidleware);