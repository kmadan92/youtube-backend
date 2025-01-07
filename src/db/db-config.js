import dotenv from 'dotenv'
import mongoose from "mongoose";
import { DB_NAME } from '../constants.js';

dotenv.config({path:'./.env'})
const uri = process.env.MONGODB_URI

const connectDB = async () => {
  try {
      const connectionInstance = await mongoose.connect(`${uri}/${DB_NAME}`)
      console.log(`MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
      console.log("MONGODB connection FAILED ", error);
      process.exit(1)
  }
}

  export default connectDB