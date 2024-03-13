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

    // ----------------> Jwt apis <-----------------//
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.send({ token });
    })

    // ----------------> Verify token <-----------------//
    const verifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send({message:'Unauthorized request'})
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({message:'Unauthorized request'})
        }
        req.decoded = decoded;
        next();
      });
    }
    // ----------------> verify admin and suurveyor <-----------------//
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const isAdmin = user?.role === 'admin';
      if (!isAdmin) {
        return res.status(403).send({ message: 'Unauthorized request' });
      }
      next();
    }
    
    const verifySurveyor = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const isSurveyor = user?.role === 'surveyor';
      if (!isSurveyor) {
        return res.status(403).send({ message: 'Unauthorized request' });
      }
      next();
    }

    // ----------------> User apis <-----------------//
    app.get('/users',verifyToken,verifyAdmin, async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    app.patch('/users/upgrade/:email', async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const updatedDoc = {
        $set: {
          role: 'prouser'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    app.get('/user/admin/:email',verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({message:'Unauthorized request'})
      }
      const query = { email: email };
      const result = await userCollection.findOne(query);
      let admin = false;
      if (result.role === 'admin') {
        admin = true;
      }
      res.send({ admin });
    });
    app.get('/user/surveyor/:email',verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({message:'Unauthorized request'})
      }
      const query = { email: email };
      const result = await userCollection.findOne(query);
      let surveyor = false;
      if (result.role === 'surveyor') {
        surveyor = true;
      }
      res.send({ surveyor });
    });
    app.patch('/users/admin/:id',verifyToken,verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })
    app.patch('/user/surveyor/:id',verifyToken,verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'surveyor'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })
    

    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'User already exists', insertedId: null })
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });


    // ----------------> Pending survey apis <-----------------//


    app.get('/pending-surveys',verifyToken,verifyAdmin, async (req, res) => {
      const result = await pendingCollection.find().toArray();
      res.send(result);
    });

    app.post('/pending-surveys',verifyToken,verifySurveyor, async (req, res) => {
      const survey = req.body;
      const result = await pendingCollection.insertOne(survey);
      res.send(result);
    });
    app.patch('/pending-surveys/:id',verifyToken,verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const status = req.body.status;
      const updatedDoc = {
        $set: {
          status: status
        }
      }
      const result = await pendingCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
    app.patch('/pending-surveys/reject/:id',verifyToken,verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const status = req.body.status;
      const adminFeedback = req.body.adminFeedback;
      console.log(adminFeedback)
      const updatedDoc = {
        $set: {
          status: status,
          adminFeedback: adminFeedback
        }
      }
      const result = await pendingCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
    app.get('/pending-surveys/:email',verifyToken,verifySurveyor, async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await pendingCollection.find(query).toArray();
      res.send(result);
    });
    app.delete('/pending-surveys/:id',verifyToken,verifySurveyor, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await pendingCollection.deleteOne(filter);
      res.send(result);
    });

    // ----------------> survey apis <-----------------//
    app.get('/surveys', async (req, res) => {
      const result = await surveyCollection.find().toArray();
      res.send(result);
    })
    app.post('/surveys',verifyToken,verifyAdmin, async (req, res) => {
      const survey = req.body;
      const result = await surveyCollection.insertOne(survey);
      res.send(result);
    });
    app.get('/surveys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await surveyCollection.findOne(query);
      res.send(result);
    })
    app.get('/surveys/filtered/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await surveyCollection.find(query).toArray();
      res.send(result);
    });

    app.patch('/surveys/report/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const report = req.body.reportText;
      const user = req.body.email;
      const newReport = { user: user, comment: report };
      const survey = await surveyCollection.findOne(filter);
      if (survey && survey.reports) {
        const update = {
          $push: { reports: newReport }
        };
        const result = await surveyCollection.updateOne(filter, update);
        res.send(result);
      } else {
        const update = {
          $set: { reports: [newReport] }
        };
        const result = await surveyCollection.updateOne(filter, update, { upsert: true });
        res.send(result);
      }
    });

    app.patch('/surveys/comment/:id', async (req, res) => {
      const id = req.params.id;
      const comment = req.body.comment;
      const username = req.body.username;
      const filter = { _id: new ObjectId(id) };
      const newComment = { username: username, comment: comment };
      const updateDoc = {
          $push: { userReview: newComment }
      };
      const result = await surveyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    
    app.patch('/surveys/dislike/:id', async (req, res) => {
      const id = req.params.id;
      const userEmail = req.body.email;
      const filter = { _id: new ObjectId(id) };
      const survey = await surveyCollection.findOne(filter);
      if (survey.likes.includes(userEmail)) {
          const updateDoc = {
              $pull: { likes: userEmail },
              $addToSet: { dislikes: userEmail }
          };
          const result = await surveyCollection.updateOne(filter, updateDoc);
          res.send(result);
      } else {
          const updateDoc = {
              $addToSet: { dislikes: userEmail }
          };
          const result = await surveyCollection.updateOne(filter, updateDoc);
          res.send(result);
      }
    });
    app.patch('/surveys/like/:id', async (req, res) => {
      const id = req.params.id;
      const userEmail = req.body.email;
      const filter = { _id: new ObjectId(id) };
      const survey = await surveyCollection.findOne(filter);
      if (survey.dislikes.includes(userEmail)) {
          const updateDoc = {
              $pull: { dislikes: userEmail },
              $addToSet: { likes: userEmail }
          };
          const result = await surveyCollection.updateOne(filter, updateDoc);
          res.send(result);
      } else {
          const updateDoc = {
              $addToSet: { likes: userEmail }
          };
          const result = await surveyCollection.updateOne(filter, updateDoc);
          res.send(result);
      }
    });
    app.patch('/surveys/vote/:id', async (req, res) => {
      const id = req.params.id;
      const option = req.body.option;
      const userEmail = req.body.email;
      const filter = { _id: new ObjectId(id) };
      const survey = await surveyCollection.findOne(filter);
      if (survey.votedPeopleMails.includes(userEmail)) {
          res.status(400).send({ error: 'User has already voted' });
      } else {
          const updateDoc = {
              $inc: { [`options.${option}`]: 1 }, 
              $addToSet: { votedPeopleMails: userEmail } 
          };
          const result = await surveyCollection.updateOne(filter, updateDoc);
          res.send(result);
      }
    });

    // ----------------> payment apis <-----------------//
    app.post('/create-payment-intent', async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      console.log("Posting payment ammount",amount)
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
      const result = await paymentCollection.insertOne(payment);
      res.send(result);
    });
    app.get('/payments',verifyToken,verifyAdmin, async (req, res) => {
      const result = await paymentCollection.find().toArray();
      res.send(result);
    });

    // ---------------> admin statistics <-----------------//
    app.get('/admin-statistics', async (req, res) => {
      const result = await surveyCollection.estimatedDocumentCount();
      const users = await userCollection.estimatedDocumentCount();
      const participationResult = await surveyCollection.aggregate([
        { $unwind: "$votedPeopleMails" },
        {
          $group: {
            _id: null,
            totalParticipation: { $sum: 1 }
          }
        }
      ]).toArray();
      const avgParticipation = result ? +((participationResult[0]?.totalParticipation / result).toFixed(2)) : 0;
      const revenueResult = await paymentCollection.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$price" }
          }
        }
      ]).toArray();
      const totalRevenue = revenueResult[0]?.totalRevenue || 0;
      const statistics = {
        totalSurveys: result,
        totalUsers: users,
        totalRevenue: totalRevenue,
        avgParticipation: avgParticipation
      }
      res.send(statistics);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
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
