import mongoose from "mongoose";


const sessionSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User' // generate relation b/w this and user model

    }
},{timestamps:true})

export const Session =  mongoose.model('Session',sessionSchema)