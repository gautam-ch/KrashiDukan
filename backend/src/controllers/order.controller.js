import { Order } from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";

export const createOrder = async(req,res)=>{
     const {name, contact, village, items, totalAmount,shopId} = req.body;     

     if(!name) throw new ApiError(400,"Customer's name is required !");
     if(!contact) throw new ApiError(400,"Customer's contact is required !");
     if(items.length <= 0) throw new ApiError(400,"Product are required to set order");
     if(!shopId) throw new ApiError(400,"Shop ID is required to set order");


     const order = new Order({
         name,
         contact,
         village:village || "N/A",
         items,
         totalAmount,
         shopId
     });

     await order.save();
     res.status(201).json(order);
}

export const  orderHistory = async(req,res)=>{
     const {Id} = req.params;
     if(!Id) throw new ApiError(400,"Shop ID is required to get order history");
     
     const page = Math.max(1, Number(req.query.page) || 1); 
     const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20)); // Default 20, max 50
     const offset = (page - 1) * limit;

     const search = (req.query.search || "").trim();
     const query = { shopId: Id };

     if (search) {
         const regex = new RegExp(search, "i");
         query.$or = [
             { name: regex },
             { contact: regex },
             { village: regex },
         ];
     }

     const [orders, totalCount] = await Promise.all([
         Order.find(query).sort({createdAt:-1}).limit(limit).skip(offset),
         Order.countDocuments(query)
     ]);

     const totalPages = Math.ceil(totalCount / limit);
     
     res.status(200).json({
         orders,
         pagination: {
             currentPage: page,
             totalPages,
             totalCount,
             limit,
             hasNextPage: page < totalPages,
             hasPrevPage: page > 1
         }
     });
}