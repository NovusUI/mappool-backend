
const nodemailer = require("nodemailer");
const {poolRequestQueue,poolProcessingQueue,acceptedJobsQueue} = require("../queues/poolRequest.queue")
const admin = require("../../firebase-config")
const BATCH_SIZE = 10;



const poolRequestBatch = async (job)=>{

//   console.log("success") 
}



const poolProcess = async(job)=>{
   


    try {
 
   
        const jobsInGrp = await poolRequestQueue.getJobs(["completed"]); 
        const poolProcessJobs = await poolProcessingQueue.getFailed()
        console.log(jobsInGrp.length)
        
        // jobsInGroup.forEach(async(job)=>{
        //     job.remove()
        // })
    
    if (jobsInGrp.length >= BATCH_SIZE) {
      console.log(jobsInGrp.length)
     let jobsInGroup = [...jobsInGrp]

     jobsInGrp.forEach(async(job)=>{
        console.log(job.id)
        job.remove()
    })

       const {newPools,rejectedJobs, acceptedJobs} = matchingAlgorithm(jobsInGroup)
     
     console.log(newPools.length,rejectedJobs.length, acceptedJobs.length)
      
    const db = admin.firestore()
    // save pool
      newPools.forEach(async(pool) => {
  
            const poolRef = db.collection("pool").doc()
            // save pool to poolDB
             await poolRef.set(pool)
            
           //take the passangerIds array and save poolId and status and matchedBy in userEvents for each user
           console.log(poolRef.id)
            // pool.passangerIds.forEach(async(id)=>{
               const id = pool.passengerIds[0]
             
                const reqInfo = acceptedJobs.find(req=> req.data.requesterId === id)
               
                
                const poolStatus ={
                    status: "paired",
                    matchedBy: reqInfo.data.matchedBy,
                    id: poolRef.id
                }
                
                const eventId = pool.eventId
                const userRef = db.collection("users").doc(id)
                const userEventDocRef = userRef.collection("userevents").doc(eventId)

                await userEventDocRef.set({poolStatus,poolId:poolStatus.id},{ merge: true })
                
            // })
   
    
        
      });
    
    const rejectedData = []
     //delete rejected list 
    rejectedJobs.forEach(async(req)=>{
        rejectedData.push(req.data)
        req.remove()
        
    })
    rejectedData.forEach(async(data)=>{
        poolRequestQueue.add(data,{})
    })

    //delete accepted jobs
     

    //send request to new worker

    acceptedJobs.forEach(async(job,index)=>{

        // acceptedJobsQueue.add(job.data)
        // console.log(job.data.requestId)

        const requestDocRef = db.collection("request").doc(job.data.requestId)
        await requestDocRef.update({
            status:"paired",
            matchedBy: job.data.matchedBy,
        })
        // job.remove()
        //save to userevents 
    })
       

    }

    } catch (error) {
        console.log(error)
    }  
}


const acceptedJobsProcess = (job)=>{
  
}





poolRequestQueue.process(poolRequestBatch)
poolProcessingQueue.process(poolProcess)
acceptedJobsQueue.process(acceptedJobsProcess)
// poolRequestQueue.process("ride",poolRequestBatch)



poolRequestQueue.addListener("completed",async(job)=>{

     poolProcessingQueue.add({group:"request"})
     
})

const poolRequest = async(data)=>{
    
    console.log("pool request")
    // data.group = "groupie"
    try {
        await poolRequestQueue.add(data,{
            //  state: "failed",
           })
    } catch (error) {
        console.error(error)
    }
  

   
}




//matching algorithm
const matchingAlgorithm = (batch)=>{

    
    const batchCopy = [...batch]

    // save only the userId
    const newPools =[]

    const rejectedJobs = []
    let acceptedJobs = []
 

    while(batchCopy.length > 1){
          
        
      
        const comparer = batchCopy.shift();
        let matched = [comparer.data];
        const seats = comparer.data.seats

   
      
        const matchedJobs = []

        for (let i = 0; i < batchCopy.length; i++) {
            const compared = batchCopy[i];
            const {isMatch,matchedBy} = checkIfMatch(comparer, compared);
            
          
            if (isMatch) {
            
            matched.push(compared.data);

            if( matchedJobs.length == 0){
                 matchedJobs.push({...comparer, data: {...comparer.data, matchedBy} })
                // matchedJobs.push(comparer)
                
            }
               matchedJobs.push({...compared, data: {...compared.data, matchedBy }})
                // matchedJobs.push(compared)
            
            batchCopy.splice(i, 1); // Remove the matched job from the batch
            i--; // Adjust the index to account for the removal
            }

            if (matched.length === seats) {
                // Pool is full, create a new pool
           
                break;
            }
        }
        if(matched.length > 1){
            const poolData = createPoolData(matched);
            newPools.push(poolData);
        }
        else if (matched.length == 1) {
          rejectedJobs.push(comparer);
        }
        if(batchCopy.length ===1){
            rejectedJobs.push(batchCopy.shift())
        }
        acceptedJobs = [...acceptedJobs, ...matchedJobs]


    }
    
    
    

    return {
        newPools,
        rejectedJobs,
        acceptedJobs,
    }
}



function checkIfMatch(comparer, compared) {
    // Compare jobs based on your criteria
    // Return true if they match, false otherwise

    const twoThings = [true,false]
    const comparedData = ["location","convPUL"]
    let index =  1
   
   
   const comparerLoc = comparer.data.poolerLoc
   const comparedLoc = compared.data.poolerLoc

  
   const regexPattern = /Magodo/i;
   if (regexPattern.test(comparerLoc) && regexPattern.test(comparedLoc)) {
    index = 0
  }
    
    return {
        isMatch:twoThings[index],
        matchedBy: "location"
    }
}
  
function createPoolData(matchedJobs) {
    // Create a new pool and pool data
    // Formulate data for the new pool
    // Push passenger IDs to the new pool

    const poolData = {
        ...matchedJobs[0],
        passengerIds:[]
    }
    
    matchedJobs.forEach((job) => {
        poolData.passengerIds.push(job.requesterId)
    });



    return poolData;
}




module.exports = {poolRequest}