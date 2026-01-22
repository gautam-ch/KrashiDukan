import mongoose from "mongoose";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";

export const createOrder = async(req,res)=>{
    const {name, contact, village, items, totalAmount,shopId} = req.body;     

    if(!name) throw new ApiError(400,"Customer's name is required !");
    if(!contact) throw new ApiError(400,"Customer's contact is required !");
    if(!Array.isArray(items) || items.length <= 0) throw new ApiError(400,"Product are required to set order");
    if(!shopId) throw new ApiError(400,"Shop ID is required to set order");

    const itemErrors = {};
    const normalizedMap = new Map();

    items.forEach((item, index) => {
        if (!item?.product) {
            itemErrors[`items.${index}.product`] = "Product id is required";
            return;
        }

        const qty = Number(item.quantity);
        const price = Number(item.price);
        let invalid = false;

        if (!Number.isFinite(qty) || qty <= 0) {
            itemErrors[`items.${index}.quantity`] = "Quantity must be greater than 0";
            invalid = true;
        }
        if (!Number.isFinite(price) || price < 0) {
            itemErrors[`items.${index}.price`] = "Price must be a valid number";
            invalid = true;
        }
        if (!item.productName) {
            itemErrors[`items.${index}.productName`] = "Product name is required";
            invalid = true;
        }

        if (invalid) return;

        const key = item.product.toString();
        const existing = normalizedMap.get(key);
        if (existing) {
            existing.quantity += qty;
        } else {
            normalizedMap.set(key, {
                product: item.product,
                productName: item.productName,
                quantity: qty,
                price,
                category: item.category || "uncategorized"
            });
        }
    });

    if (Object.keys(itemErrors).length > 0) {
        throw new ApiError(400, "Invalid order items", itemErrors);
    }

    const normalizedItems = Array.from(normalizedMap.values());

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const productIds = normalizedItems.map((item) => item.product);
        const products = await Product.find({
            _id: { $in: productIds },
            shopId
        }).session(session);

        if (products.length !== productIds.length) {
            throw new ApiError(404, "One or more products not found for this shop");
        }

        const productMap = new Map(products.map((p) => [p._id.toString(), p]));

        normalizedItems.forEach((item) => {
            const product = productMap.get(item.product.toString());
            if (!product) {
                throw new ApiError(404, "Product not found");
            }
            if (product.quantity < item.quantity) {
                throw new ApiError(409, `Only ${product.quantity} available for ${product.title}`);
            }
        });

        const bulkOps = normalizedItems.map((item) => ({
            updateOne: {
                filter: { _id: item.product, shopId, quantity: { $gte: item.quantity } },
                update: { $inc: { quantity: -item.quantity } }
            }
        }));

        const bulkResult = await Product.bulkWrite(bulkOps, { session });
        if (bulkResult.modifiedCount !== bulkOps.length) {
            throw new ApiError(409, "Insufficient stock for one or more products");
        }

        const computedTotal = normalizedItems.reduce((sum, item) => (
            sum + item.quantity * Number(item.price || 0)
        ), 0);

        const [order] = await Order.create([{
            name,
            contact,
            village: village || "N/A",
            items: normalizedItems,
            totalAmount: Number.isFinite(Number(totalAmount)) ? Number(totalAmount) : computedTotal,
            shopId
        }], { session });

        await session.commitTransaction();
        res.status(201).json(order);
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }
}

export const  orderHistory = async(req,res)=>{
     const {Id} = req.params;
     if(!Id) throw new ApiError(400,"Shop ID is required to get order history");

    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20)); // Default 20, max 50
    const cursor = req.query.cursor ? String(req.query.cursor) : null;
    const cursorId = req.query.cursorId ? String(req.query.cursorId) : null;
    const includeTotal = req.query.includeTotal === "true" || !cursor;

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

     let pagedQuery = query;
     let cursorDate = null;

     if (cursor && cursorId) {
         if (!mongoose.Types.ObjectId.isValid(cursorId)) {
             throw new ApiError(400, "Invalid cursor id");
         }
         cursorDate = new Date(cursor);
         if (Number.isNaN(cursorDate.getTime())) {
             throw new ApiError(400, "Invalid cursor date");
         }
         const keysetFilter = {
             $or: [
                 { createdAt: { $lt: cursorDate } },
                 { createdAt: cursorDate, _id: { $lt: cursorId } }
             ]
         };
         pagedQuery = { $and: [query, keysetFilter] };
     }

     const orders = await Order.find(pagedQuery)
         .sort({ createdAt: -1, _id: -1 })
         .limit(limit + 1);

     const hasNextPage = orders.length > limit;
     const items = hasNextPage ? orders.slice(0, limit) : orders;
     const lastItem = items[items.length - 1];
     const nextCursor = hasNextPage && lastItem
         ? {
             cursor: lastItem.createdAt?.toISOString(),
             cursorId: lastItem._id.toString()
         }
         : null;

     const pagination = {
         limit,
         hasNextPage,
         nextCursor,
     };

     if (includeTotal) {
         const totalCount = await Order.countDocuments(query);
         pagination.totalCount = totalCount;
     }
     
     res.status(200).json({
         orders: items,
         pagination
     });
}