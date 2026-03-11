import express from "express";
import { getSalesAnalytics } from "../controllers/analytics.controller.js";
import { catchAsync } from "../utils/catchAsync.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/analytics/sales/:shopId", catchAsync(getSalesAnalytics));

export default router;
