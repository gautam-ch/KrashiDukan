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
    }
},{
    timestamps:true
})

export const Product = mongoose.model("Product",productSchema);