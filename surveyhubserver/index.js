const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASS:", process.env.DB_PASS);
// DO NOT log DB_PASS to console for security
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uwwtyq1.mongodb.net/?appName=Cluster0`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uwwtyq1.mongodb.net/?retryWrites=true&w=majority`;
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
    // await client.connect();
    const surveyCollection = client.db("surveyDB").collection("allsurveys");
    const userCollection = client.db("surveyDB").collection("users");
    const pendingCollection = client.db("surveyDB").collection("pendingSurveys");
    const paymentCollection = client.db("surveyDB").collection("payments");

    // Initialize Middlewares
    const { verifyToken, verifyAdmin, verifySurveyor } = require('./middlewares/authMiddleware')(userCollection);

    // Initialize Routes
    app.use(require('./routes/authRoutes'));
    app.use(require('./routes/userRoutes')(userCollection, verifyToken, verifyAdmin, verifySurveyor));
    app.use(require('./routes/pendingSurveyRoutes')(pendingCollection, verifyToken, verifyAdmin, verifySurveyor));
    app.use(require('./routes/surveyRoutes')(surveyCollection, verifyToken, verifyAdmin));
    app.use(require('./routes/paymentRoutes')(paymentCollection, stripe, verifyToken, verifyAdmin));
    app.use(require('./routes/statsRoutes')(surveyCollection, userCollection, paymentCollection, verifyToken, verifyAdmin));


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Server is running')
})

app.listen(port, () => {
  console.log(`Current active port: ${port}`);
})
module.exports = app;