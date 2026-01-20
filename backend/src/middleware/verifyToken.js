import jwt from 'jsonwebtoken';

export const verifyToken = async (req, res, next) => {
   // Support both legacy "token" cookie and current "accessToken"
   const token = req.cookies?.accessToken || req.cookies?.token;

   if (!token) {
      return res.status(401).json({ sucess: false, message: 'Not authenticated!' });
   }

   jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
      if (err) {
         return res.status(403).json({ sucess: false, message: 'Token is invalid!' });
      }

      req.userId = payload.userId;
      next();

   });
}