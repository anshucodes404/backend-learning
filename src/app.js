import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//middlewares                                 
app.use(cors({origin: process.env.CORS_ORIGIN,credentials: true,}));
app.use(express.json({limit: "20kb",}));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser())


//Importing routes
import userRouter from "./routes/user.route.js";

//Routes declaration
app.use("/users", userRouter)


export default app;
