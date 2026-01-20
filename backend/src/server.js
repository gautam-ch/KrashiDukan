import dotenv from 'dotenv'
dotenv.config({ path: './src/.env' });
import {app} from './app.js'
import { dbConnect } from './utils/dbConnect.js';

const port=3000;
app.listen(port,async()=>{
     await dbConnect();
     console.log(`Server is running on port: ${port}`);
})
