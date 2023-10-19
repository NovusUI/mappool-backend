const admin = require("../firebase-config")

const poolProcess = async(requests)=>{
      




    const {newPools,acceptedJobs} = matchingAlgorithm(requests)
     
    console.log(newPools.length, acceptedJobs.length)
      
     const db = admin.firestore()
     
     try{
    // save pool
      newPools.forEach(async(pool) => {
     
            const poolRef = db.collection("pool").doc()
            // save pool to poolDB
            
            
             await poolRef.set(pool)
             
            
           //take the passangerIds array and save poolId and status and matchedBy in userEvents for each user
    
           pool.passengerIds.forEach(async(id)=>{

                const reqInfo = acceptedJobs.find(req=> req.requesterId === id)
                
                if(reqInfo.eventId){
                console.log(reqInfo)
                const poolStatus = {
                    status: "paired",
                    matchedBy: reqInfo.matchedBy,
                    id: poolRef.id
                }
                console.log(poolStatus)
                    // const eventId = pool.eventId
                    const eventId = reqInfo.eventId
                    const userRef = db.collection("users").doc(id)
                    const userEventDocRef = userRef.collection("userevents").doc(eventId)
                    await userEventDocRef.set({poolStatus,poolId:poolStatus.id},{ merge: true })
                }
                
             })
   
    
        
      });
    
  
    acceptedJobs.forEach(async(job,index)=>{

        // acceptedJobsQueue.add(job.data)
        // console.log(job.data.requestId)

        const requestDocRef = db.collection("request").doc(job.id)
        await requestDocRef.update({
            status:"paired",
            matchedBy: job.matchedBy,
        })
        // job.remove()
        //save to userevents 
    })
       

    

    } catch (error) {
        console.log(error)
    }  
}



const matchingAlgorithm = (batch)=>{

    
    const batchCopy = [...batch]

    // save only the userId
    const newPools =[]

    // const rejectedJobs = []
    let acceptedJobs = []
 

    while(batchCopy.length > 1){

        const comparer = batchCopy.shift();
        let matched = [comparer];
        const seats = comparer.seats

   
      
        const matchedJobs = []

        for (let i = 0; i < batchCopy.length; i++) {
            const compared = batchCopy[i];
            const {isMatch,matchedBy} = checkIfMatch(comparer, compared);
            
          
            if (isMatch) {
            
            matched.push(compared);

            if( matchedJobs.length == 0){
                 matchedJobs.push({...comparer, matchedBy})
               
                
            }
               matchedJobs.push({...compared,matchedBy })
               
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
        // else if (matched.length == 1) {
        //   rejectedJobs.push(comparer);
        // }
        if(batchCopy.length ===1){
            
            batchCopy.shift()
        }
        acceptedJobs = [...acceptedJobs, ...matchedJobs]


    }
    
    
    

    return {
        newPools,
        acceptedJobs,
    }
}



function checkIfMatch(comparer, compared) {
    // Compare jobs based on your criteria
    // Return true if they match, false otherwise

    const twoThings = [true,false]
    const comparedData = ["location","convPUL"]
    let index =  1
   
   
   const comparerLoc = comparer.poolerLoc
   const comparedLoc = compared.poolerLoc

  
   const regexPattern = /Magodo/i;

   if ( comparer.requesterId !== compared.requesterId && regexPattern.test(comparerLoc) && regexPattern.test(comparedLoc)) {
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

     

    const poolType = matchedJobs[0].poolType == "carpoolOffer" ? "carpool" : "pool"

    const poolData = {
        ...matchedJobs[0],
        poolType,
        passengerIds:[]
    }

   
    
    matchedJobs.forEach((job) => {
        poolData.passengerIds.push(job.requesterId)
    });

  

    return poolData;
}

module.exports = {
    poolProcess,
    checkIfMatch,
    createPoolData
}