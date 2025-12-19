import mongoose from 'mongoose';

export const dbConnect =async()=>{
      
      try{
            await mongoose.connect(process.env.MONGO);
            
            console.log("Database is connected");
      }
      catch(err){
        console.error("Db connect error",err);
      }
}