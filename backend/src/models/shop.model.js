import mongoose  from "mongoose";
import { Schema } from "mongoose";

const shopSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    owners:[{
        type:Schema.Types.ObjectId,
        ref:"User"
    }],
},{
     timestamps:true
})

shopSchema.index({owners:1});

export const Shop = mongoose.model("Shop",shopSchema);