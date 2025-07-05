import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    console.log(req.cookies);
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // console.log(typeof token === String);
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    // console.log("token", token)

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    //this gives the info of user, it verifies whether this token was signed by my access token secret
    //Suppose this token was signed earlier like this:
    //const token = jwt.sign({ userId: "123" }, process.env.ACCESS_TOKEN_SECRET);
    //Later, you verify it like this:
    //const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    //decodedToken now contains: { userId: "123", iat: ..., exp: ... }

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    console.log(user);
    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
