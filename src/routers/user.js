const express = require("express");
const router = new express.Router();

const auth = require('../middleware/auth');
const User = require("../models/user");
const multer = require('multer')
const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) return cb(new Error('Please upload a jpg,jpeg or png file.'))
    cb(undefined, true)
  }
})

//Login route for users
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.send({
      user,
      token
    });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//Create a new user / Sign up a new user
router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    const savedUser = await user.save();
    if (!savedUser) throw new Error("Unable to signup user");

    const token = await user.generateAuthToken();
    res.send({
      savedUser,
      token
    });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//Returns the current logged in users profile
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user)
})

//Logs out the user
router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token
    })
    await req.user.save();

    res.send();
  } catch (e) {
    res.send(e.message)
  }
})

//Return all users
router.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find({});
    if (users.length < 1) throw new Error("No users exist.");
    res.send(users);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//Update existing user by id
router.patch("/users/me", auth, async (req, res) => {
  const user = req.user;
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate || updates.length < 1)
    return res
      .status(400)
      .send({
        error: "Invalid properties specified to update!."
      });

  try {
    updates.forEach((update) => (user[update] = req.body[update]));
    const saved = await user.save();
    if (!saved) return res.send("User id not found!.");
    res.send(saved);
  } catch (e) {
    res.send(e.message);
  }
});

//Delete existing user by id
router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove()
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e.message);
  }
});


//Add avatar to user profile
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  req.user.avatar = req.file.buffer;
  await req.user.save();
  res.send()
}, (error, req, res, next) => {
  res.status(400).send({
    error: error.message
  })
})

//Delete avatar from user profile
router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save()
  res.send()
})

//returns profile picture of a user by _id
router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) throw new Error()
    res.set('Content-Type', 'image/jpg');
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send()
  }
})

module.exports = router;