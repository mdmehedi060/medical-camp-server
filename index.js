const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app=express();
const port =process.env.PORT || 5000;


// middleware

app.use(cors())
app.use(express.json())

// medical-camp
// LqHy6QAW0fFyJBcD




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3pbm41d.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const campCollection = client.db('madicalDb').collection('camps');
    const testimonileCollection = client.db('madicalDb').collection('testimonile');



  // camps related api
  app.get('/camps', async(req,res)=>{
    const result=await campCollection.find().toArray();
    res.send(result)
})
  



// testimonile related api
  app.get('/testimonile', async(req,res)=>{
    const result=await testimonileCollection.find().toArray();
    res.send(result)
})





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/',(req,res)=>{
    res.send('Medical Camp is running')
})


app.listen(port,()=>{
    console.log(`Medical Camp is sitting on port ${port}`);
})