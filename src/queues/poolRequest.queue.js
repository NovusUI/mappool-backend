const Bull = require("bull")
// const {poolRequestProcess} = require("../processes/poolRequest.process")

// const { setQueues } = require('bull-board')
// const { BullAdapter } = require('bull-board/bullAdapter')
// const { BullMQAdapter } = require('bull-board/bullMQAdapter')

// create new queue instance
const poolRequestQueue = new Bull("poolRequest",{
    redis:{
        host: "redis://red-ckktb4qv7m0s73cjphbg",
        port: "6379"
    }
})

const poolProcessingQueue = new Bull("poolProcessing",{
    redis:{
        host: "redis://red-ckktb4qv7m0s73cjphbg",
        port: "6379"
    }
})

const acceptedJobsQueue =new Bull("acceptedJobs",{
    redis:{
        host: "redis://red-ckktb4qv7m0s73cjphbg",
        port: "6379"
    }
})

// setQueues({
//     new BullAdapter(emailQueue)
// })

// poolRequestQueue.process("pool",poolRequestProcess)
// poolRequestQueue.process("carpool",poolRequestProcess)
// poolRequestQueue.process("ride",poolRequestProcess)


// const poolRequest = async(data)=>{
//     console.log("requested")
//    poolRequestQueue.add("pool",data,{
//      group: "groupie"
//    })

   
// }

module.exports =  {poolRequestQueue, poolProcessingQueue, acceptedJobsQueue}


