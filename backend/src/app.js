import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import errorHandler from './middleware/errorHandler.js';
import authRoute from './routes/auth.route.js';
import shopRoute from './routes/shop.route.js';
import productRoute from './routes/product.route.js';
import orderRoute from './routes/order.route.js';

export const app = express();

app.use(cors({
  origin: [
    "https://krashi-dukan.vercel.app",
    "https://www.krashi-dukan.vercel.app",
  ],
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
