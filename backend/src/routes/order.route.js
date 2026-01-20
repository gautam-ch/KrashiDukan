import express from "express";
import { createOrder, orderHistory } from "../controllers/order.controller.js";
import { catchAsync } from "../utils/catchAsync.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/order", verifyToken, catchAsync(createOrder));

router.get('/order/:Id', verifyToken, catchAsync(orderHistory));

export default router;
