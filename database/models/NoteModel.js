import mongoose, { Schema, model } from "mongoose";

const noteSchema = new Schema({
    content: { 
      type: String, 
      required: true 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
    user_id : {
      type : mongoose.Schema.Types.ObjectId,
      ref : "User",
      required : true
    }
  });
  
const Note = model("Note", noteSchema);
export default Note
  