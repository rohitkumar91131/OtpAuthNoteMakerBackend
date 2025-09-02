import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    dob : {
        type : Date,
    },
    joining_date: { 
        type: Date, 
        default: Date.now 
    },
});
  
const User = model("User", userSchema);
export default User