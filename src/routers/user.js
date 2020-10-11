const express = require('express')
const router = new express.Router();
const User = require('../models/user');

//Create a new user
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try{
        const savedUser = await user.save();
        if (!savedUser) throw new Error('User not saved!.');
        res.status(201).send(savedUser)
    }catch(e){
        res.status(400).send(e.message)
    }
})

//Return all users
router.get('/users', async (req,res) =>{
    try{
        const users = await User.find({});
        if(users.length < 1) throw new Error('No users exist.');
        res.send(users)
    }catch(e){
        res.status(400).send(e.message);
    }
})

//Return user by id
router.get('/users/:id', async(req,res)=>{
    const _id = req.params.id;
    try{
        const user = await User.findById(_id);
        if(!user) throw new Error('User not found!.');
        res.send(user)
    }catch(e){
        res.status(500).send(e.message);
    }
})


//Update existing user by id
router.patch('/users/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','email','password','age']
    const isValidUpdate = updates.every((update)=>allowedUpdates.includes(update))

    if(!isValidUpdate || updates.length < 1) return res.status(400).send({error:'Invalid properties specified to update!.'});

    try{
        const user = await User.findByIdAndUpdate({_id:req.params.id},req.body,{new:true, runValidators:true, useFindAndModify:false});
        if (!user) return res.send('User id not found!.');
        res.send(user)
    }catch(e){
        res.send(e.message)
    }
})

//Delete existing user by id
router.delete('/users/:id', async (req, res)=>{
    try{
        const user = await User.findByIdAndDelete({_id:req.params.id});
        if(!user) res.status(404).send('User id not found!.');
        res.send(user)
    }catch(e){
        res.status(500).send(e.message);
    }
})

module.exports = router;