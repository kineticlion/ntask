const mongoose = require("mongoose");
const validator = require("validator")

const User = mongoose.model("User", {
    name: {
      type: String,
      trim: true
    },
    age: {
      type: Number,
      required: true,
      validate(value){
        if(value < 0) throw new Error('Age must be greater than 0')
      }
    },
    email:{
      type:String,
      required:true,
      unique:true,
      validate(value){
        if(!validator.isEmail(value)) throw new Error('must be a valid email address');
      },
      trim:true
    },
    password:{
      required:true,
      type: String,
      trim:true,
      validate(value){
        if(value.toLowerCase().includes('password')) throw new Error("Password cannot contain spaces!.")
      }
    }
  });
  
  module.exports = User