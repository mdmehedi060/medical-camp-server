const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

    const userCollection = client.db('madicalDb').collection('users');
    const campCollection = client.db('madicalDb').collection('camps');
    const testimonileCollection = client.db('madicalDb').collection('testimonile');
    const addcampCollection = client.db('madicalDb').collection('addcamp');



// users related api
app.get('/users', async (req, res) => {
  console.log(req.headers);
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.get('/users/organizer/:email', async (req, res) => {
      const email = req.params.email;

      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'forbidden access' })
      }

      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === 'organizer';
      }
      res.send({ organizer });
    })

app.post('/users', async (req,res)=>{
const user =req.body;
// insert email if user doesnt exists: 
      // you can do this many ways (1. email unique, 2. upsert 3. simple checking)
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
const result = await userCollection.insertOne(user);
res.send(result);
})

app.patch('/users/organizer/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      role: 'organizer'
    }
  }
  const result = await userCollection.updateOne(filter, updatedDoc);
  res.send(result);
})


  app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })


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

// add camp api

app.get('/addcamp', async (req, res)=>{
  const cursor= addcampCollection.find();
  const result = await cursor.toArray();
  res.send(result);
})


app.get('/addcamp/:id', async (req,res)=>{
  const id =req.params.id;
  console.log("id",id);
  const quary = {_id : new ObjectId(id)};
  const result = await addcampCollection.findOne(quary);
  console.log('result',result);
  res.send(result);
})


app.post('/addcamp', async (req,res)=>{
  const newCamp=req.body;
  // console.log(newCamp);
  const result=await addcampCollection.insertOne(newCamp);
  res.send(result);
})


app.delete('/addcamp/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) }
  const result = await addcampCollection.deleteOne(query);
  res.send(result);
})


// update blog api

app.put('/addcamp/:id', async (req,res)=>{
  const id =req.params.id;
  const filter = {_id : new ObjectId(id)};
  const options= {upsert: true};
  const updateCamp=req.body;
  const blog ={
    $set: {
      title: updateCamp.title, 
      category: updateCamp.category,    
      shortdiscription: updateCamp.shortdiscription, 
      longdiscription: updateCamp.longdiscription, 
      photo:updateCamp.photo,
    }
  }
 const result =await addcampCollection.updateOne(filter,blog,options);
 res.send(result);
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