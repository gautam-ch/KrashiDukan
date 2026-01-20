import { addOwner, createShop, getMyShop } from "../controllers/shop.controller.js";
import {catchAsync} from "../utils/catchAsync.js";
import {Router} from "express";
import {verifyToken} from '../middleware/verifyToken.js'

const router= Router();

router.post('/createShop',verifyToken,catchAsync(createShop));
router.post('/addOwner',verifyToken,catchAsync(addOwner));
router.get('/shop/me',verifyToken,catchAsync(getMyShop));


export default router;

