import {Router} from "express";
import { login, logout, refresh, signup } from "../controllers/auth.controller.js";
import { catchAsync } from "../utils/catchAsync.js";

const router=Router();

router.post('/signup',catchAsync(signup));
router.post('/signin',catchAsync(login));
router.post('/signout',catchAsync(logout));
router.post('/refresh',catchAsync(refresh));


export default router;