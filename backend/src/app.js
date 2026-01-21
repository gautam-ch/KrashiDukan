import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import errorHandler from './middleware/errorHandler.js';
import authRoute from './routes/auth.route.js';
import shopRoute from './routes/shop.route.js';
import productRoute from './routes/product.route.js';
import orderRoute from './routes/order.route.js';

export const app = express();

const corsOptions = {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
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
