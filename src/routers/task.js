const express = require("express");
const router = new express.Router();
const Task = require("../models/task");
const auth = require("../middleware/auth")

//Create a new Task
router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id
  });

  try {
    const savedTask = await task.save();
    if (!savedTask) throw new Error("Task was not saved properly!.");
    res.status(201).send(savedTask);
  } catch (e) {
    res.send(e.message);
  }
});

//Return task by id
router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id
  try {
    const task = await Task.findOne({
      _id,
      owner: req.user._id
    })
    if (!task) return res.status(404).send('')
    res.send(task)
  } catch (e) {
    res.status(404).send()
  }
})

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=10
// GET /tasks?sortBy=createdAt:desc

//Return all tasks
router.get("/tasks", auth, async (req, res) => {
  const match = {}
  const sort = {}

  if (req.query.completed) match.completed = req.query.completed === "true";
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "asc" ? 1 : -1;
  }


  try {
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
      }
    }).execPopulate();
    const tasks = req.user.tasks;
    if (tasks.length < 1) return res.status(404).send({
      error: 'No tasks found!.'
    });
    res.send(tasks);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//Update existing task by id
router.patch("/tasks/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
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
    console.log(req.params.id)
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    updates.forEach(update => task[update] = req.body[update]);
    const taskSaved = await task.save();
    if (!task || !taskSaved) throw new Error("Task id not found!.");
    // const task = await Task.findByIdAndUpdate({_id:req.params.taskId},req.body,{new:true, runValidators:true, useFindAndModify:false})
    res.send(task);
  } catch (e) {
    res.status(404).send(e.message);
  }
});

//Delete existing task by id
router.delete("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id
  try {
    const task = await Task.findOneAndDelete({
      _id,
      owner: req.user._id
    })
    if (!task) res.status(404).send("Task id not found!.");
    res.send(task);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;