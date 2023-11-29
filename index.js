const express = require('express');
require('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app=express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const port =process.env.PORT || 5000;


// middleware

app.use(cors())
app.use(express.json())






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3pbm41d.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

 // middlewares 
//  const verifyToken = (req, res, next) => {
//   console.log('inside verify token', req.headers.authorization);
//   if (!req.headers.authorization) {
//     return res.status(401).send({ message: 'unauthorized access' });
//   }
//   const token = req.headers.authorization.split(' ')[1];
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(401).send({ message: 'unauthorized access' })
//     }
//     req.decoded = decoded;
//     next();
//   })
// }

// use verify admin after verifyToken
// const verifyAdmin = async (req, res, next) => {
//   const email = req.decoded.email;
//   const query = { email: email };
//   const user = await userCollection.findOne(query);
//   const isOrganizer = user?.role === 'organizer';
//   if (!isOrganizer) {
//     return res.status(403).send({ message: 'forbidden access' });
//   }
//   next();
// }








async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const userCollection = client.db('madicalDb').collection('users');
    const testimonileCollection = client.db('madicalDb').collection('testimonile');
    const addcampCollection = client.db('madicalDb').collection('addcamp');
    const joincampCollection = client.db('madicalDb').collection('joincamp');
    const paymentCollection = client.db("madicalDb").collection("payments");



// jwt related api

  // app.post('/jwt', async (req, res) => {
  //           const user = req.body;
  //           console.log('user for token', user);
  //           const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
  //           res.cookie('token', token, {
  //               httpOnly: true,
  //               secure: true,
  //               sameSite: 'none'
  //           })
  //               .send({ success: true });
  //       })





// users related api
app.get('/users', async (req, res) => {
  console.log(req.headers);
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.get('/users/organizer/:email',async (req, res) => {
      const email = req.params.email;

      // if (email !== req.decoded.email) {
      //   return res.status(403).send({ message: 'forbidden access' })
      // }

      const query = { email: email };
      const user = await userCollection.findOne(query);
      let organizer = false;
      if (user) {
        organizer = user?.role === 'organizer';
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

    // joincamp related api

    app.post('/joincamp', async (req,res)=>{
      const newCamp=req.body;
      // console.log(newCamp);
      const result=await joincampCollection.insertOne(newCamp);
      // console.log('result',result);
      res.send(result);
    })

    app.get('/joincamp', async (req, res) => {
      console.log(req.headers);
          const result = await joincampCollection.find().toArray();
          res.send(result);
        });

        app.delete('/joincamp/:id', async (req, res) => {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) }
          const result = await joincampCollection.deleteOne(query);
          res.send(result);
        })

        app.put('/joincamp/:id', async (req,res)=>{
          const id =req.params.id;
          const filter = {_id : new ObjectId(id)};
          const options= {upsert: true};
          const updateCamp=req.body;
          const camp ={
            $set: {
              title: updateCamp.title, 
              category: updateCamp.category,    
              shortdiscription: updateCamp.shortdiscription, 
              longdiscription: updateCamp.longdiscription, 
              photo:updateCamp.photo,
            }
          }
         const result =await joincampCollection.updateOne(filter,camp,options);
         consol.log('update result',result);
         res.send(result);
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
  // console.log("id",id);
  const quary = {_id : new ObjectId(id)};
  const result = await addcampCollection.findOne(quary);
  // console.log('result',result);
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
  const camp ={
    $set: {
      title: updateCamp.title, 
      category: updateCamp.category,    
      shortdiscription: updateCamp.shortdiscription, 
      longdiscription: updateCamp.longdiscription, 
      photo:updateCamp.photo,
    }
  }
 const result =await addcampCollection.updateOne(filter,camp,options);
 res.send(result);
})

// payment intent
app.post('/create-payment-intent', async (req, res) => {
  const { price } = req.body;
  const amount = parseInt(price * 100);
  // console.log(amount, 'amount inside the intent')

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: 'usd',
    payment_method_types: ['card']
  });

  res.send({
    clientSecret: paymentIntent.client_secret
  })
});

  app.post('/payments', async (req, res) => {
  const payment = req.body;
  const paymentResult = await paymentCollection.insertOne(payment);

  //  carefully delete each item from the cart
  // console.log('payment info', payment);
  const query = {
    _id: {
      $in: payment.cartIds.map(id => new ObjectId(id))
    }
  };

  const deleteResult = await joincampCollection.deleteMany(query);

  res.send({ paymentResult, deleteResult });
})


app.get('/payments/:email', async (req, res) => {
  const query = { email: req.params.email }
  // if (req.params.email !== req.decoded.email) {
  //   return res.status(403).send({ message: 'forbidden access' });
  // }
  const result = await paymentCollection.find(query).toArray();
  res.send(result);
})




 // stats or analytics
//  app.get('/admin-stats', verifyToken, verifyAdmin, async (req, res) => {
//   const users = await userCollection.estimatedDocumentCount();
//   const menuItems = await menuCollection.estimatedDocumentCount();
//   const orders = await paymentCollection.estimatedDocumentCount();

//   // this is not the best way
//   // const payments = await paymentCollection.find().toArray();
//   // const revenue = payments.reduce((total, payment) => total + payment.price, 0);

//   const result = await paymentCollection.aggregate([
//     {
//       $group: {
//         _id: null,
//         totalRevenue: {
//           $sum: '$price'
//         }
//       }
//     }
//   ]).toArray();

//   const revenue = result.length > 0 ? result[0].totalRevenue : 0;

//   res.send({
//     users,
//     menuItems,
//     orders,
//     revenue
//   })
// })
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
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