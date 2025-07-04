import { User } from "../models/user.model";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, resizeBy, next) => {
  //we may do not have access to cookies for example in mobiles so doing chaining
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
  
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }
  
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  
    const user = User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
  
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token")
  }
});
