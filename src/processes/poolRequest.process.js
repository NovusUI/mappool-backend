
const nodemailer = require("nodemailer");
const {poolRequestQueue,poolProcessingQueue} = require("../queues/poolRequest.queue")
const BATCH_SIZE = 10;



const poolRequestBatch = async (job)=>{

  


  console.log("success") 
}

const poolProcess = async(job)=>{
   
     console.log(job.data.group)

    try {
 
   
        const jobsInGroup = await poolRequestQueue.getJobs(["completed"]); 
        const request = await poolProcessingQueue.getJobs(["completed"],{gro})
        // jobsInGroup.forEach(async(j)=>{
        //     j.remove()
        // })
    
   
    if (jobsInGroup.length >= BATCH_SIZE) {
        let count = 0
        console.log(jobsInGroup.length, "job-length")
        


        //   jobsInGroup.forEach(async(j)=>{
        //     count++

            // if theres no match. requeue
            // const data = j.data
            // j.remove()
            // poolRequestQueue.add(data,{
            //     //  state: "failed",
            // })

            
 
        // })

    //    const result = matchingAlgorithm(jobsInGroup)
       
        console.log(count, "deleted")
    }
    } catch (error) {
        console.log(error)
    }  
}


poolRequestQueue.process(poolRequestBatch)
poolProcessingQueue.process(poolProcess)

poolRequestQueue.process("ride",poolRequestBatch)

poolRequestQueue.addListener("completed",async(job)=>{

     poolProcessingQueue.add({group:"request"})
     
})

const poolRequest = async(data)=>{

    // data.group = "groupie"
   poolRequestQueue.add(data,{
    //  state: "failed",
   })

   
}

const matchingAlgorithm = (batch)=>{
   
    const newPool = []
    const rejected = []

    return {
        newPool,
        rejected
    }
}




module.exports = {poolRequest}