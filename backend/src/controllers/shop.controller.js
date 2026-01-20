import { ApiError } from '../utils/ApiError.js'
import { Shop } from '../models/shop.model.js';
import { User } from '../models/user.model.js';
import mongoose from 'mongoose';

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
