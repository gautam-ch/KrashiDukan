import {Shop} from '../models/shop.model.js';
import { Product } from '../models/product.model.js';
import {ApiError} from "../utils/ApiError.js"


export const addProduct =async(req,res)=>{
      const userId = req.userId;
      const shopId = req.params.shopId;

      if(!userId ) throw new ApiError(401,"Unauthorized user!");
      if(!shopId ) throw new ApiError(400,"Required Shop-ID");

      const shop =await Shop.findById(shopId);
      if(!shop) throw new ApiError(404,"Shop not found !");

      const isOwner = shop.owners.some(
            id => id.toString() === userId
        );
      if(!isOwner) throw new ApiError(403,"Forbidden");

      const details=req.body;

      const errors={};

      if(!details?.title) errors.title="Title of product is required !";
      if(!details?.description) errors.description="Description of product is required !";
      if(!details?.costPrice) errors.costPrice="Cost Price  of product is required !";
      if(!details?.sellingPrice) errors.sellingPrice="Selling Price of product is required !";
      if(!details?.expiryDate) errors.expiryDate="Expiry date of product is required !";
      if(!details?.quantity) errors.quantity="Quantity of product is required !";

      if(Object.keys(errors).length>0) throw new ApiError(400,"All fields are required!",errors);


      await Product.create({...details,shopId}); 

      res.status(201).json({success:true,message:"Product created successfully"});

}

export const getProducts= async(req,res)=>{
      const shopId=req.params.shopId;
      const userId= req.userId;

      if(!userId ) throw new ApiError(401,"Unauthorized user!");
      if(!shopId ) throw new ApiError(400,"Required Shop-ID");


      const shop =await Shop.findById(shopId);
      if(!shop) throw new ApiError(404,"Shop not found !");

      const isOwner = shop.owners.some(
            id => id.toString() === userId
        );
      if(!isOwner) throw new ApiError(403,"Forbidden");


      const products =await Product.find({shopId});

      res.status(200).json({
        success:true,
        products,
        message:"fetched products successfully"
      })

}
