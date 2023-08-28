import mongoose from "mongoose";


export interface ICourseSchemaDocument extends mongoose.Document {
    title:string;
    description:string;
    poster:{
        public_id:string,
        url:string,
    };
    lectures:Array<
        {
         _id?:string,   
         title:string,
         description:string, 
         video:{
             public_id:string,     
             url:string, 
         }
        }
     >



     views?:number,
     numOfVideos?:number,
    category:string,
    createdBy:string,
    createdAt:Date,

}

const courseSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true,"Please enter you're vidoe title"],
        minlength:[8,"title should be more than of 10 characters"],
        maxlength:[100,"title should not be more than of 100 characters"]

    },

    description:{
        type:String,
        required:[true,"Please enter you're vidoe description"],
        minlength:[20,"description should be more than of 10 characters"],

    },

    poster:{
        public_id:{
            type:String,
            required:true        
        },

        url:{
            type:String,
            required:true
        }
    },

    lectures:[
       {
        title:{
            type:String,
            required:[true,"Please enter you're vidoe title"],
            minlength:[8,"title should be more than of 10 characters"],
            maxlength:[100,"title should not be more than of 100 characters"]
    
        },

        description:{
            type:String,
            required:[true,"Please enter you're vidoe description"],
            minlength:[20,"description should be more than of 10 characters"],
    
        },

        video:{
            public_id:{
                type:String,
                required:true        
            },
    
            url:{
                type:String,
                required:true
            }
        }
       }
    ],
    
    

    views:{
        type:Number,
        default:0
    },

    numOfVideos:{
        type:Number,
        default:0
    },

    category:{
        type:String,
        required:[true,"please select category"]
    },

    createdBy:{
        type:String,
        required:[true,"please enter creator name"]
    },

    createdAt:{
        type:Date,
        default:Date.now
    },
});

export const Course =mongoose.model<ICourseSchemaDocument>('Course',courseSchema);