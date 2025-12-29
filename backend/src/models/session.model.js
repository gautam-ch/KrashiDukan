import { Schema } from "mongoose";
import mongoose from "mongoose";

const sessionSchema= new Schema({
    userId:{
       type:Schema.Types.ObjectId,
       ref:"User"
    },
    token:{
       type:String,
       required:true, 
    },
    expiresAt:{
        type:Date,
        required:true

    }
  },{
     timestamps:true,
  }
)


const Session = mongoose.model('Session',sessionSchema);
export default Session;