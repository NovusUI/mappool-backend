const Bull = require("bull")
const poolRequestProcess = require("../processes/poolRequest.process")

// const { setQueues } = require('bull-board')
// const { BullAdapter } = require('bull-board/bullAdapter')
// const { BullMQAdapter } = require('bull-board/bullMQAdapter')

// create new queue instance
const poolRequestQueue = new Bull("pool",{
    redis:{
        host: "127.0.0.1",
        port: "6379"
    }
})

// setQueues({
//     new BullAdapter(emailQueue)
// })

poolRequestQueue.process("pool",poolRequestProcess)
poolRequestQueue.process("carpool",poolRequestProcess)
poolRequestQueue.process("ride",poolRequestProcess)


const poolRequest = async(data)=>{
   poolRequestQueue.add("pool",data,{

   })

   
}

module.exports = poolRequest


