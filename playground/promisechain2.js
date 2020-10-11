require('../src/db/mongoose')
const Task = require('../src/models/task')

// Task.findByIdAndDelete({_id:'5f81256d1e6a644946d570cb'})
//     .then((task)=>{
//         if(!task) throw new Error('task id does not exist');
//         console.log(task)
//         return Task.countDocuments({completed:false})
//     })
//     .then(count=> console.log(count))
//     .catch((e)=>console.log(e.message))


const deleteAndCount = async (id) => {
    const task = await Task.findByIdAndDelete(id)
    if(!task) throw new Error(`Task with ID: '${id}' does not exist.`);
    const count = await Task.countDocuments({completed:false});
    return count;   
}

deleteAndCount('5f80968336f27941dd9142c9')
.then(res=>console.log(`Total number of incomplete documents : ${res}`))
.catch(e=>console.log(e.message))