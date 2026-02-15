import mongoose from 'mongoose';
import dotenv from 'dotenv'
dotenv.config()

export const connectDB = async () =>{
    try{
      const conn= await mongoose.connect(process.env.MONGODB_URL)
    //   console.log("MongoDB connected successfully", conn);;
      console.log(`MongoDB connected: ${conn.connection.host}`);
    }catch(error){
        console.log(`Error: ${error.message}`);
        process.exit(1); // Exit the process with failure
    }
}