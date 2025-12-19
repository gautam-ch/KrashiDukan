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
    products:[{
        type:Schema.Types.ObjectId,
        ref:"Product"
    }]
},{
     timestamps:true
})

export const Shop = mongoose.model("Shop",shopSchema);