import mongoose from "mongoose";

const connectDB = async()=>{
    try{
       await mongoose.connect(`${process.env.MONGO_URI}/Ekart-yt`)
       console.log("mongoDB connect successfuklly")

    }catch(error){
        console.log("Mongodb Connection failed:" , error);
    }


}
export default connectDB;