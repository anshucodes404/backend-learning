// require('dotenv').config()  can do this it will run but this disrupts the consistency so doing it in another way

import dotenv from "dotenv"
import connectBD from "./db/index.js"
import app from "./app.js"

dotenv.config({path: './env'})

//an async function will return a promise so can use then and catch
connectBD()
.then(() => {
  app.listen(process.env.PORT || 4000, () => {
    console.log(`Server is running at port: ${process.env.PORT}`)
  })
})
.catch((err) => {
  console.log("MONGO db connection failed", err)
})



/*  ONE WAY
import express from "express";
const app = express()(
  // function connectDB(){}
  // connectDB()  can do like this but there is another simpler way

  //iife
  async () => {
    try {
      await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
      app.on("error", (error) => {
        console.log("ERROR: ", error);
        throw error;
      });
      app.listen(process.env.PORT, () => {
        console.log(`App is listening on port ${process.env.PORT}`)
      })
    } catch (error) {
      console.log("ERROR: ", error);
      throw error;
    }
  }
)();
*/