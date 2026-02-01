import { User } from "../models/userModel.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { verifyEmail } from "../emailVerify/verifyEmail.js";
import { Session } from "../models/sessionModel.js";
import { sendOtpEmail } from "../emailVerify/sendOtpEmail.js";

export const register  = async (req, res)=>{
    try{
       const {firstName, lastName , email , password} = req.body;
       if(!firstName || !lastName || !email || !password){
        res.status(400).json({
            success:false,
            message:"All fields are required"
        })
       }
       const user = await User.findOne({email})
       if(user){
        res.status(400).json({
            success:false,
            message:"User already Exist"
        })
       }
       const hashedPassword =  await bcrypt.hash(password,10)
       const newUser  = await User.create({
        firstName,
        lastName , 
        email ,
        password:hashedPassword
       })

       const token = jwt.sign({id:newUser.id},process.env.SECRET_KEY,{expiresIn:'10m'})
       verifyEmail(token,email) //send email here
       newUser.token = token;
       await newUser.save();
       console.log("SIGN SECRET:", process.env.SECRET_KEY)
       return res.status(201).json({
        success:true,
        message:"User register successfully",
        user:newUser
       })
    }catch(error){
      res.status(500).json({
        success:true,
        message:error.message,
      })
    }
}


export const verify = async(req,res)=>{
  try{
    const authHeader = req.headers.authorization

    if(!authHeader || !authHeader.startsWith("Bearer ")){
      res.status(400).json({
        success: false,
        message:"Authorization token is missing or invalid"
      })
    }

    const token = authHeader.split(" ")[1] //[bearer, sdfggfvd]
    let decoded 
    try{
      decoded = jwt.verify(token , process.env.SECRET_KEY)

    }catch(error){
      if(error.name === "TokenExpiredError"){
        return res.status(400).json({
          success:false,
          message:"The resigstration token is expiered"
        })
      }
      return res.status(400).json({
       success:false,
       message:"Token verification failed"
      })

    }

    const user = await User.findById(decoded.id);
    if(!user){
      return res.status(400).json({
        success:false,
        message:'User not Found'
      })
    }
    user.token = null
    user.isVerified = true
    await user.save()
    
    return res.status(200).json({
      success:true,
      message:"Email verified successfully"
    })
  }catch(error){

    res.status(500).json({
      success:false,
      message: error.message
    })

  }
}


export const reverify = async(req, res)=>{
  try{
    const {email} = req.body;
    const user = await User.findOne({email})

    if(!user){
      return res.status(400).json({
        success:false,
        message:"User not found"
      })
    }

    const token = jwt.sign({id: user._id},process.env.SECRET_KEY,{expiresIn:'10m'})
       verifyEmail(token,email) //send email here 
       user.token = token
       await user.save();
       return res.json({
        success:true,
        message:"verification mail send again succesfully",
        token:user.token
       })

  }catch(error){
    return res.status(500).json({
      success:false,
      message:error.message
    })

  }
}

export const login = async(req, res)=>{
  try{

    const{email,password} =  req.body;
    if(!email || !password){
      return res.status(400).json({
        success:false,
        message:'All fields are required'
      })
    }
    const existingUser = await User.findOne({email});

    if(!existingUser){
      return res.status(400).json({
        success:false,
        message:'User not exists'
      })
    }

    const isPasswordValid =  await bcrypt.compare(password, existingUser.password)
    if(!isPasswordValid){
      return res.status(400).json({
        success:false,
        message:'Invalid credentials'
      })
    }

    if(existingUser.isVerified === false){

      return res.status(400).json({
        success:false,
        message:"Verify You account than login "
      })
    }

     //generate token
    const accessToken =  jwt.sign({id:existingUser._id} , process.env.SECRET_KEY , {expiresIn: '10d'});
    const refreshToken =  jwt.sign({id:existingUser._id} , process.env.SECRET_KEY , {expiresIn: '10d'});
    
    existingUser.isLoggedin = true
    await existingUser.save()
    //check for existing user sesion
    const existingSession =  await Session.findOne({userId: existingUser._id})
    if(existingSession){
      await Session.deleteOne({userId:existingUser._id})
    }

    //create session for usetr
    await Session.create({userId:existingUser._id})
    return res.status(200).json({
      success:true,
      message:`Welcome Back ${existingUser.firstName}`,
      user: existingUser,
      accessToken,
      refreshToken
    })

  }catch(error){
   return res.status(500).json({
      success:false,
      message:error.message
    })
  }
}


export const logout = async(req, res)=>{
  try{

    const userId = req.id
    await Session.deleteMany({userId :userId}) // delete all session which is being creted when i m logged out
    await User.findByIdAndUpdate(userId , {isLoggedin:false})

    return res.status(200).json({
      success:true,
      message:'User Logged out successfully'
    })


  }catch(error){
    return res.status(500).json({
      success:false,
      message:error.message
    })
  }
}


export const forgotPassword = async(req, res)=>{
  try{

    const {email} = req.body;
    const user = await User.findOne({email})
    if(!user){
      return res.status(400).json({
        success:false,
        message:'User not found'
      })
    }

    const otp = Math.floor(100000 + Math.random()*900000).toString();
    const otpExpiry = new Date(Date.now()+10*60*1000) //10 mins
    user.otp = otp;
    user.otpExpiry =  otpExpiry;

    await user.save()
    await sendOtpEmail(otp , email)
    
    return res.status(200).json({
      success:true,
      message:'Otp send to email successfully'
    })

  }catch(error){
    return res.status(500).json({
      success:false,
      message: error.message
    })
  }
}


export const verifyOtp = async(req, res)=>{
  try{

    const {otp} = req.body;
    const email=  req.params.email

    if(!otp){
      return res.status(400).json({
        success:false,
        message: 'Otp is required'

      })
    }

    const user = await User.findOne({email});
    if(!user){
      return res.status(400).json({
        success:false,
        message:'User not found'
      })
    }
    if(!user.otp || !user.otpExpiry){
      return res.status(400).json({
        success:false,
        message: 'Otp is not generated or already verified'
      })
    }
    if(user.otpExpiry < new Date()){
      return res.status(400).json({
        success:false,
        message: 'Otp is expired please request a new one'
      })
    }

    if(otp !== user.otp){
      return res.status(400).json({
        success:false,
        message:' Otp is invalid'
      })
    }

    user.otp = null,
    user.otpExpiry = null

    await user.save()
    return res.status(200).json({
      success:true,
      message:'OTP verified successsfully'
    })


  }
  catch(error){
    return res.status(500).json({
      success:false,
      message:error.message
    })
  }
}

export const changePassword = async(req, res)=>{
  try{

    const {newPassword , confirmPassword} = req.body;
    const {email} =  req.params
    const user =  await User.findOne({email})
    if(!user){
      return res.status(400).json({
        success:false,
        message:'User not found'
      })
    }

    if(!newPassword || !confirmPassword){
      return res.status(400).json({
        success:false,
        message: 'All fields are required '
      })
    }
    if(newPassword !== confirmPassword){
      return res.status(400).json({
        success:false,
        message:'Password donot match'
      })
    }

    const hashedPassword = await bcrypt.hash(newPassword , 10);
    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      success:true,
      message:'Password change successfully'
    })

  }catch(error){
    return res.status(500).json({
      success:false,
      message:error.message
    })
  }
}


export const allUser = async(req, res)=>{
  try{

    const users = await User.find()

    return res.status(200).json({
      success:true,
      users
    })

  }catch(error){
    return res.status(500).json({
      success:false,
      message:error.message
    })
  }
}

export const getUserById =  async(req, res)=>{
  try{
    const {userId} = req.params; //extract user id from request param
    const user = await User.findById(userId).select("-password  ,-otp ,-otpExpiry , -token") // which field you dont want to show within select
    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not found"
      })
    }
    return res.status(200).json({
      success:true,
      user
    })

  }catch(error){

    return res.status(500).json({
      success:false,
      message:error.message
    })

  }
}
