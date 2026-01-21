import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import errorHandler from './middleware/errorHandler.js';
import authRoute from './routes/auth.route.js';
import shopRoute from './routes/shop.route.js';
import productRoute from './routes/product.route.js';
import orderRoute from './routes/order.route.js';

export const app = express();

const defaultOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = new Set([
      defaultOrigin,
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
]);

app.use(cors({
      origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (allowedOrigins.has(origin)) return callback(null, true);
            if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
            if (/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) return callback(null, true);
            return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

app.get('/health',(req,res)=>{
      res.status(200).json({message:"Server is Live!"});
})

app.use('/auth',authRoute);
app.use(shopRoute);
app.use(productRoute);
app.use(orderRoute);

app.use(errorHandler);
