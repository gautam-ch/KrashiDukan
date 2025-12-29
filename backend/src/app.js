import express from 'express';
import errorHandler from './middleware/errorHandler.js';
import authRoute from './routes/auth.route.js';


export const app = express();


app.use(express.json());


app.get('/health',(req,res)=>{
      res.status(200).json({message:"Server is Live!"});
})

app.use('/auth',authRoute);

app.use(errorHandler);
