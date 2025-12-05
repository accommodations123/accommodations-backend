import mongoose from 'mongoose'
const userSchema = new mongoose.Schema({
    email:{
        type:String,
        trim:true,
        default:null
    },
    phone:{
        type:String,
        trim:true,
        default:null,
    },
    otp:{
        type:String,
        trim:true
    },
    otpExpires:{type:Date},
    verified:{
        type:Boolean,
        default:false
    }
})
userSchema.index({email:1},{unique:true,sparse:true})
userSchema.index({phone:1},{unique:true,sparse:true})
export default mongoose.model('User',userSchema)