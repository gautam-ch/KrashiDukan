import mongoose  from "mongoose";
import { Schema } from "mongoose";

const productSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    img:{
        type:String,
    },
    category:{
        type:String
    },
    sprayCount:{
       type:Number,
    },
    costPrice:{
        type:String,
        required:true,
    },
    sellingPrice:{
        type:Number,
        required:true,
    },
    tags:{
        type:[String],
    },
    expiryDate:{
        type:Date,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    shopId:{
        type:Schema.Types.ObjectId,
        ref:"Shop"
    }
},{
    timestamps:true
})

productSchema.index({ shopId: 1,category: 1, sprayCount: 1 });

export const Product = mongoose.model("Product",productSchema);