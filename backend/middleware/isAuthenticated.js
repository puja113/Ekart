
import { User } from "../models/userModel.js"
import jwt from 'jsonwebtoken'

//next is middleware means it runs b/w client request and server response
export const isAuthenticated = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
  
      // ✅ Header missing
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: "Authorization header missing",
        });
      }
  
      // ✅ Safe parsing (handles extra spaces/tabs)
      const parts = authHeader.split(" ").filter(Boolean);
  
      if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({
          success: false,
          message: "Invalid authorization format. Use Bearer <token>",
        });
      }
  
      const token = parts[1];
  
      let decoded;
  
      try {
        decoded = jwt.verify(token, process.env.SECRET_KEY);
      } catch (error) {
  
        // ✅ Expired token
        if (error.name === "TokenExpiredError") {
          return res.status(401).json({
            success: false,
            message: "Access token expired. Please login again.",
          });
        }
  
        // ✅ Invalid token
        return res.status(401).json({
          success: false,
          message: "Invalid access token",
        });
      }
  
      // ✅ Correct DB lookup
      const user = await User.findById(decoded.id);
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
  
      // ✅ attach user
      req.id = user._id;
      req.user = user;
  
      next();
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }


  export const isAdmin = (req, res, next)=>{

    if(req.user && req.user.role === 'admin'){
      next()
    }
    else{
      return res.status(403).json({
        success:false,
        message: 'Access denied: admins only '
      })
    }
  }