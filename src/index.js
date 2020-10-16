const express = require('express')

require('./db/mongoose')
const User = require('./models/user')
const Task = require('./models/task')

//loading routes
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express();
const port = process.env.PORT || 3000;


const multer = require('multer')
const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(doc|docx)$/)) {
      return cb(new Error('Please upload a Word Document'))
    }

    cb(undefined, true)
  }
})
const auth = require('./middleware/auth');

app.post('/upload', auth, upload.single('upload'), async (req, res) => {
  req.user.avatar = req.file.buffer
  await req.user.save();
  res.send()
}, (error, req, res, next) => {
  res.status(400).send({
    error: error.message
  })
})



app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () =>
  console.log(`Server is listening on port http://localhost:${port}`)
);