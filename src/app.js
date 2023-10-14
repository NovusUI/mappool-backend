const express = require("express")
const authMiddleware = require("./middleware/authentication")
const {poolRequest} = require("./processes/poolRequest.process")
const cors = require("cors")


require("dotenv").config()
const port = process.env.PORT ||3004


const app = express()



const allowedOrigins = ["http://localhost:3000"];

const corsOptions =  {
    origin:allowedOrigins,

}
app.use(cors(corsOptions))

app.use(authMiddleware)
app.use(express.json())

app.post("/api/v1/process-pool-request",(req,res)=>{

   const requestData= (req.body)
  
    poolRequest(requestData)
    res.status(200).send({msg:"success"})
})

app.get("/api/v1/process-ride-request",(req,res)=>{
    res.send("success")
})




app.listen(port,()=>{
    console.log(`listening on port ${port}`)
})