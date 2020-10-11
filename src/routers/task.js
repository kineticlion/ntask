const express = require('express');
const router = new express.Router();
const Task = require('../models/task')


//Create a new Task
router.post('/tasks', async (req, res)=>{
    const task = new Task(req.body);
    try{
       const savedTask = await task.save(); 
       if(!savedTask) throw new Error('Task was not saved properly!.');
       res.status(201).send(savedTask);
    }catch(e){
        res.send(e.message)
    }
});

//Return all tasks
router.get('/tasks', async (req,res) =>{
    try{
        const tasks = await Task.find({});
        if(tasks.length < 1) throw new Error('No tasks exist.');
        res.send(tasks)
    }catch(e){
        res.status(400).send(e.message);
    }
})

//Update existing task by id
router.patch('/tasks/:taskId', async (req, res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidUpdate = updates.every((update)=>allowedUpdates.includes(update));
    console.log(updates.length)
    if(!isValidUpdate || updates.length < 1) return res.status(400).send({error: "Invalid properties specified to update!."})

    try{
        const task = await Task.findByIdAndUpdate({_id:req.params.taskId},req.body,{new:true, runValidators:true, useFindAndModify:false})
        if(!task) throw new Error('Task id not found!.');
        res.send(task);
    }catch(e){
        res.status(404).send(e.message)
    }
})

//Delete existing task by id
router.delete('/tasks/:id', async (req, res)=>{
    try{
        const task = await Task.findByIdAndDelete({_id:req.params.id});
        if(!task) res.status(404).send('Task id not found!.');
        res.send(task)
    }catch(e){
        res.status(500).send(e.message);
    }
})

module.exports = router;