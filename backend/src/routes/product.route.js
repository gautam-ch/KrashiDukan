import { addProduct,getProducts } from "../controllers/product.controller.js";
import {Router} from "express";
import {verifyToken} from "../middleware/verifyToken.js"
import { catchAsync } from "../utils/catchAsync.js";

const router = Router();

router.post('/shops/:shopId/product',verifyToken,catchAsync(addProduct));
router.get('/shops/:shopId/products',verifyToken,catchAsync(getProducts));


export  default router;
