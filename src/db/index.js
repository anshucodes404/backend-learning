import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectBD = async () => {
    try {
      const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
      console.log(`MongoDB connected !! DB HOST: ${connectionInstance}`)
      console.log(`MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`) //consoles the host where my db is being hosted
    } catch (error) {
        console.log("MongoDB connection FAILED: ", error);
        process.exit(1);
    }
}

export default connectBD;