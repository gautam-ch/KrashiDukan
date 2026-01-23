import { ApiError } from '../utils/ApiError.js'
import { Shop } from '../models/shop.model.js';
import { User } from '../models/user.model.js';
import { Product } from '../models/product.model.js';
import { Order } from '../models/order.model.js';
import mongoose from 'mongoose';

const analyticsCache = globalThis.analyticsCache || new Map();
globalThis.analyticsCache = analyticsCache;
const ANALYTICS_CACHE_TTL_MS = Number(process.env.ANALYTICS_CACHE_TTL_MS || 60_0000);

const getCachedAnalytics = (cacheKey) => {
    const cached = analyticsCache.get(cacheKey);
    if (!cached) return null;
    if (cached.expiresAt <= Date.now()) {
        analyticsCache.delete(cacheKey);
        return null;
    }
    return cached.payload;
};

const setCachedAnalytics = (cacheKey, payload) => {
    if (ANALYTICS_CACHE_TTL_MS <= 0) return;
    analyticsCache.set(cacheKey, {
        expiresAt: Date.now() + ANALYTICS_CACHE_TTL_MS,
        payload
    });
};

export const createShop = async (req, res) => {
    const userId = req.userId;
    const { name } = req.body;

    if (!userId || !name) throw new ApiError(400, "Missing required fields!");

    const hasShop = await Shop.findOne({ owners: { $in: [userId] } });

    if (hasShop) {
        throw new ApiError(409, 'Unable to create shop');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    let createdShop;

    try {
        const [shop] = await Shop.create([{
            name,
            owners: [userId]
        }], {
            session
        })

        createdShop = shop;

        await User.updateOne({
            _id: userId
        }, {
            $set: { role: 'owner' }
        }, {
            session
        })

        await session.commitTransaction();
    }
    catch (err) {
        await session.abortTransaction();
        throw err;
    }
    finally {
        session.endSession();
    }

    res.status(201).json({
        success: true,
        message: "Shop is created successfully!",
        shop: createdShop
    })
}

export const addOwner = async (req, res) => {
    const { userId, email } = req.body;
    const ownerId = req.userId;

    //resolve target user either by id or email
    const targetUser = userId
        ? await User.findOne({ _id: userId })
        : await User.findOne({ email });

    if (!targetUser) throw new ApiError(404, 'User does not exist!');

    const alreadyOwner = await Shop.exists({ owners: targetUser._id });
    if (alreadyOwner) throw new ApiError(409, "User already owns a shop");

    const shop = await Shop.findOne({ owners: { $in: [ownerId] } });
    if (!shop) throw new ApiError(401, "Unauthorized user!");


    const session = await mongoose.startSession();
    session.startTransaction();


    try{
          
        await Shop.updateOne({
            _id: shop._id
        },
            {
                $addToSet: { owners: targetUser._id },
            },{
                session
            })
        
        await User.updateOne({
            _id: targetUser._id,
        },{
            $set:{role:"owner"}
        },{
            session
        })

        await session.commitTransaction();
    }
    catch(err){
        await session.abortTransaction();
        throw err
    }
    finally{
        session.endSession();
    }

    res.status(200).json({success:true,message:"User added as owner of shop successfully"});
}

export const getMyShop = async (req, res) => {
    const ownerId = req.userId;
    if (!ownerId) throw new ApiError(401, "Unauthorized user!");

    const shop = await Shop.findOne({ owners: { $in: [ownerId] } });
    if (!shop) throw new ApiError(404, "Shop not found for this user");

    res.status(200).json({ success: true, shop });
}

export const getShopAnalytics = async (req, res) => {
    const ownerId = req.userId;
    const { shopId } = req.params;
    const { refresh } = req.query;

    if (!ownerId) throw new ApiError(401, "Unauthorized user!");
    if (!shopId) throw new ApiError(400, "Shop ID is required");

    const shop = await Shop.findById(shopId);
    if (!shop) throw new ApiError(404, "Shop not found for this user");

    const isOwner = shop.owners.some((id) => id.toString() === ownerId);
    if (!isOwner) throw new ApiError(403, "Forbidden");

    const cacheKey = `shop-analytics:${shopId}`;
    const shouldRefresh = String(refresh).toLowerCase() === 'true';
    if (shouldRefresh) {
        analyticsCache.delete(cacheKey);
        res.set('X-Cache', 'BYPASS');
    }

    if (ANALYTICS_CACHE_TTL_MS > 0 && !shouldRefresh) {
        const cached = getCachedAnalytics(cacheKey);
        if (cached) {
            res.set('X-Cache', 'HIT');
            res.set('Cache-Control', `private, max-age=${Math.floor(ANALYTICS_CACHE_TTL_MS / 1000)}`);
            return res.status(200).json(cached);
        }
    }

    if (!shouldRefresh) {
        res.set('X-Cache', 'MISS');
    }

    const shopObjectId = new mongoose.Types.ObjectId(shopId);
    const totalProducts = await Product.countDocuments({ shopId: shopObjectId });

    const [orderSummary] = await Order.aggregate([
        { $match: { shopId: shopObjectId } },
        {
            $group: {
                _id: null,
                totalSales: { $sum: { $ifNull: ["$totalAmount", 0] } },
                totalOrders: { $sum: 1 },
                averageOrderValue: { $avg: { $ifNull: ["$totalAmount", 0] } }
            }
        }
    ]);

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const monthlySales = await Order.aggregate([
        {
            $match: {
                shopId: shopObjectId,
                createdAt: { $gte: start }
            }
        },
        {
            $group: {
                _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                total: { $sum: { $ifNull: ["$totalAmount", 0] } }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const salesByMonth = [];

    for (let i = 5; i >= 0; i -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const label = `${monthLabels[date.getMonth()]} ${String(year).slice(-2)}`;
        const match = monthlySales.find((entry) => entry._id.year === year && entry._id.month === month);
        salesByMonth.push({ label, total: match ? match.total : 0 });
    }

    const payload = {
        success: true,
        shop: { _id: shop._id, name: shop.name },
        metrics: {
            totalProducts,
            totalSales: orderSummary?.totalSales || 0,
            totalOrders: orderSummary?.totalOrders || 0,
            averageOrderValue: orderSummary?.averageOrderValue || 0,
            salesByMonth
        }
    };

    setCachedAnalytics(cacheKey, payload);
    if (ANALYTICS_CACHE_TTL_MS > 0) {
        res.set('Cache-Control', `private, max-age=${Math.floor(ANALYTICS_CACHE_TTL_MS / 1000)}`);
    }
    res.status(200).json(payload);
}
