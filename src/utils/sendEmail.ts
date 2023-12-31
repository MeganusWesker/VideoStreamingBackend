import { createTransport} from "nodemailer";

export const sendEmail =async(email:string,subject:string,text:string)=>{

   let transpoter =createTransport({
    service:process.env.SMPT_SERVICE,    
      auth:{
         user:process.env.SMPT_EMAIL,
         pass:process.env.SMPT_PASS
      }
   });



 await transpoter.sendMail({
        from:process.env.SMPT_EMAIL,
        to:email,
        subject,
        text
    })
}