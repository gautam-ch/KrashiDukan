import {Router} from "express";
import { login, logout, refresh, signup, me } from "../controllers/auth.controller.js";
import { catchAsync } from "../utils/catchAsync.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router=Router();

router.post('/signup',catchAsync(signup));
router.post('/signin',catchAsync(login));
router.post('/signout',catchAsync(logout));
router.post('/refresh',catchAsync(refresh));
router.get('/me', verifyToken, catchAsync(me));


export default router;