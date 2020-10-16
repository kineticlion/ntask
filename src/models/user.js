const mongoose = require("mongoose");
const validator = require("validator")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  age: {
    type: Number,
    required: true,
    validate(value) {
      if (value < 0) throw new Error('Age must be greater than 0')
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) throw new Error('must be a valid email address');
    },
    trim: true
  },
  password: {
    required: true,
    type: String,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes('password')) throw new Error("Password cannot include the word 'password'")
    }
  },
  avatar: {
    type: Buffer
  },
  tokens: [{
    token: {
      type: String,
      required: true,
    }
  }]
}, {
  timestamps: true
})

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({
    _id: user._id.toString()
  }, 'randomcharacters')

  user.tokens = user.tokens.concat({
    token
  })

  await user.save();

  return token;
}

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject
}

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({
    email
  })
  if (!user) throw new Error('User not found!.');

  const isValidUser = await bcrypt.compare(password, user.password);
  if (!isValidUser) throw new Error("Unable to login.");

  return user;
}

userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
})

userSchema.pre('remove', async function (next) {
  const user = this;
  await Task.deleteMany({
    owner: user._id
  })
})

const User = mongoose.model("User", userSchema);

module.exports = User