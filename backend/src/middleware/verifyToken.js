import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Session from '../models/session.model.js';
import { ACCESS_TOKEN_TTL_MS, cookieOpts } from '../utils/authCookies.js';

export const verifyToken = async (req, res, next) => {
   // Support both legacy "token" cookie and current "accessToken"
   const token = req.cookies?.accessToken || req.cookies?.token;

   if (!token) {
      return res.status(401).json({ sucess: false, message: 'Not authenticated!' });
   }

   jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
      if (!err && payload?.userId) {
         req.userId = payload.userId;
         return next();
      }

      if (err?.name !== 'TokenExpiredError') {
         return res.status(403).json({ sucess: false, message: 'Token is invalid!' });
      }

      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
         return res.status(401).json({ sucess: false, message: 'Not authenticated!' });
      }

      const hashed = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const session = await Session.findOne({ token: hashed });

      if (!session || session.expiresAt.getTime() < Date.now()) {
         await Session.deleteOne({ token: hashed });
         res.clearCookie('accessToken', cookieOpts);
         res.clearCookie('refreshToken', cookieOpts);
         return res.status(401).json({ sucess: false, message: 'Session expired!' });
      }

      const newAccessToken = jwt.sign({ userId: session.userId }, process.env.JWT_SECRET, { expiresIn: '30m' });
      res.cookie('accessToken', newAccessToken, { ...cookieOpts, maxAge: ACCESS_TOKEN_TTL_MS });
      req.userId = session.userId;
      return next();
   });
}