

const admin = require("../firebase-config")
const { checkIfMatch, createPoolData } = require("./matchingAlgorithm")

const carpoolProcess = async(request)=>{
      


   

    const {newCarpool:newPools,acceptedRequests:acceptedJobs} = matchingAlgorithm(request.offers, request.requests)
     
     console.log(newPools, acceptedJobs)
      
     const db = admin.firestore()
     
     try{
    // save pool
      newPools.forEach(async(pool) => {
     
            const poolRef = db.collection("pool").doc()
            // save pool to poolDB
            
            
            await poolRef.set(pool)
             
            
           //take the passangerIds array and save poolId and status and matchedBy in userEvents for each user
    
           pool.passengerIds.forEach(async(id,index)=>{


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
                    
               
                
               if(index == 0){
                await userEventDocRef.set({yourPoolStatus:poolStatus,yourPoolId:poolStatus.id},{ merge: true })

               }else{
                
                    await userEventDocRef.set({carPoolStatus:poolStatus,carpoolId:poolStatus.id},{ merge: true })
                
                }
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




const matchingAlgorithm = (carPoolOffers, carPoolRequests) =>{
     
   const offerCopy = [...carPoolOffers]
   const requestCopy = [...carPoolRequests]

   const newCarpool =[]
   let acceptedRequests = []

   while(offerCopy.length > 0){

    const comparer = offerCopy.shift()
    let matched = [comparer]

    // add 1 which is the driver
    const seats = comparer.seats + 1


    const matchedRequests = []
      
    for (let i = 0; i < requestCopy.length; i++) {

        const compared = requestCopy[i]
        const {isMatch, matchedBy} = checkIfMatch(comparer, compared)
        

    if (isMatch) {
        matched.push(compared);
        if( matchedRequests.length == 0){
            matchedRequests.push({...comparer, matchedBy})
          
           
       }
       matchedRequests.push({...compared,matchedBy })
       requestCopy.splice(i, 1);
       i--;
    }

    if (matched.length === seats) {
        // Pool is full, create a new pool
   
        break;
    }
   }

    if(matched.length > 1){
        const poolData = createPoolData(matched);
        newCarpool.push(poolData);
    }

    acceptedRequests =[...acceptedRequests, ...matchedRequests]
 
  }

  return {
    newCarpool,
    acceptedRequests,
 }
}

module.exports = {carpoolProcess}
