import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Session from "../models/session.model.js";


export const signup = async (req, res) => {

    const { name, email, password } = req.body;

    const errors = {};
    if (!name) errors.name = "Name is required!"
    if (!email) errors.email = "Email is required!"
    if (!password) errors.password = "Password is required!"

    if (Object.keys(errors).length > 0) {
        throw new ApiError(400, "Invalid input!", errors)
    }

    //existing user 
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, "Email already registered!");
    }


    if (!password || password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters long");
    }

    const hashPassword = await bcrypt.hash(password, 12);

    await User.create({ name, email, password: hashPassword });

    res.status(201).json({
        success: true,
        message: "User registered successfully!"
    })

}

const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:  process.env.NODE_ENV === "production" ? "None" : "Lax",
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    const errors = {};

    if (!email) errors.email = "Email is required!";
    if (!password) errors.password = "Password is required!";

    if (Object.keys(errors).length > 0) {
        throw new ApiError(400, "Credentials are required!", errors);
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(401, "User does not exist!");
    }


    const pwd = await bcrypt.compare(password, user.password);

    if (!pwd) {
        throw new ApiError(401, "Invalid password!");
    }

    //access token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30m' });

    res.cookie('accessToken', token, {
        ...cookieOpts, maxAge: 30 * 60 * 1000 //30min 
    })

    //Refresh token

    const refreshToken = crypto.randomBytes(64).toString("hex");

    const hashed = crypto.createHash("sha256").update(refreshToken).digest("hex")

    await Session.create({
        userId: user._id,
        token: hashed,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    })

    res.cookie('refreshToken', refreshToken, {
        ...cookieOpts,
        maxAge: 30 * 24 * 60 * 60 * 1000 //30Day
    })



    res.status(200).json({ success: true, message: "User login successfully!" });

}


export const logout = async (req, res) => {
    const token = req.cookies.refreshToken;

    if (token) {
        const hashed = crypto.createHash('sha256').update(token).digest('hex');
        await Session.deleteOne({ token: hashed });
    }

    res.clearCookie("accessToken",cookieOpts);

    res.clearCookie("refreshToken",cookieOpts);


    res.status(200).json({ success: true, message: "User logged out successfully!" })

}


export const refresh = async (req, res) => {
    const token = req.cookies.refreshToken;

    if (!token) throw new ApiError(401, "Unauthorized request!");

    const hashed = crypto.createHash("sha256").update(token).digest('hex');

    const session = await Session.findOne({ token: hashed });

    if (!session || session.expiresAt.getTime() < Date.now()) {
        await Session.deleteOne({ token: hashed });

        res.clearCookie("accessToken", cookieOpts);
        res.clearCookie("refreshToken", cookieOpts);

        throw new ApiError(401, "Session expired");
    }


    const accessToken = jwt.sign({ userId: session.userId }, process.env.JWT_SECRET, { expiresIn: '30m' });

    res.cookie('accessToken', accessToken, {
        ...cookieOpts,
        maxAge: 30 * 60 * 1000 //30min
    })

    res.status(200).json({ success: true, message: "Token created successfully!" })

}