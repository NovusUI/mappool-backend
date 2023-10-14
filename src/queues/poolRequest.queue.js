const Bull = require("bull")
const Redis = require("ioredis")
// const {poolRequestProcess} = require("../processes/poolRequest.process")

// const { setQueues } = require('bull-board')
// const { BullAdapter } = require('bull-board/bullAdapter')
// const { BullMQAdapter } = require('bull-board/bullMQAdapter')

// create new queue instance

const client = new Redis({
    host:process.env.RENDER_REDIS_HOST_NAME,
    port: process.env.RENDER_REDIS_PORT
});



const poolRequestQueue = new Bull("poolRequest", client)

const poolProcessingQueue = new Bull("poolProcessing", client)

const acceptedJobsQueue =new Bull("acceptedJobs",client)

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


