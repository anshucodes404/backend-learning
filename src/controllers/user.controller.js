import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from jsonwebtoken

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validation not empty
  //check if user already exist: username, email
  //check for images, check for avatar
  //if all correct upload them to cloudinary
  //create a user object - create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //return response

  const { fullname, username, email, password } = req.body; //destructuring
  console.log("email: ", email);

  // if(fullname === ""){
  //   throw new ApiError(400, "fullname is required")
  // }  can check one by one but advanced you can use

  if (
    [fullname, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError("All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with same email or username already exist");
  }

  console.log(req.body);
  console.log(req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // let coverImageLocalPath;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path || "";
  // if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
  //   coverImageLocalPath = req.files.coverImage[0].path
  // }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  //checking if user is created or not
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //get email or username, password from user
  //check if the user info exist in the db if matches then do login if not exist then throw an error and redirect to login page
  //access and refresh token generate
  //send cookies
  //send response

  const { email, username, password } = req.body;
  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(404, "User do not exist");
  }

  //This userFound is the instance of the User saved in mongoDB, own created methods are available in userFound not User
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password not correct");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  user.refreshToken = refreshToken;

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in Successfully"
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

//creating this endpoint because once accessToken is expired the user have to re-login, so to avoid that taking the user refreshToken which is stored in cookies, so that using that token and generating another access and refresh token and storing new refresh token in database and saving access and refresh token in cookies user
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request")
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)  //have access of the user id
    const user = await User.findById(decodedToken?._id)

    if (!user) {
      throw new ApiError(401, "Invalid refresh token")
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used")
    }

    const options = {
      httpOnly: true,
      secure: true
    }

    const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

    return res.status(200).cookies("accessToken", accessToken, options).cookies("refreshToken", newRefreshToken, options).json(
      new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access Token refreshed")
    )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
  }

});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user?._id
  const user = await User.findById(userId)

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Old Password is not correct")
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: true })

  return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(200, req.user, "Current user fetched successfully")
    )
})

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname } = req.body
  if (!fullname) {
    throw new ApiError(400, "Full name is required")
  }

  const user = await User.findByIdAndUpdate(req.user?._id,
    {
      $set: {
        fullname
      }
    },
    { new: true } //new returns the updated user info
  ).select("-password")

  return res.status(200).json(new ApiResponse(200, user, "Account Details updated successfully"))
})

const avatarUserUpdate = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
      throw new ApiError(400, "avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar){
      throw new ApiError(501, "Error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, 
      {
        $set: {
          avatar: avatar.url
        }
      },
      {new: true}
    ).select("-password")


    return res.status(200)
    .json(new ApiResponse(200, user, "Avatar uploaded successfully"))
}) 

const coverImageUserUpdate = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if(!coverImageLocalPath){
      throw new ApiError(400, "avatar file is missing")
    }

    const coverImage = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar){
      throw new ApiError(501, "Error while uploading coverImage")
    }

    await User.findByIdAndUpdate(req.user?._id, 
      {
        $set: {
          coverImage: coverImage.url
        }
      },
      {new: true}
    ).select("-password")
    
    return res.status(200)
    .json(new ApiResponse(200, user, "CoverImage uploaded successfully"))
}) 

export { registerUser, loginUser, logOutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, avatarUserUpdate, coverImageUserUpdate };
