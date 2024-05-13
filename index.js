const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require('dotenv').config()
const jsonWebToken = require("jsonwebtoken");
const app = express();
const port = process.env.PORT|5000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@foodnest.clyvw7v.mongodb.net/?retryWrites=true&w=majority&appName=foodNest`;

app.use(cors());
app.use(express.json());
app.use(cookieParser());




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
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get("/", (req, res) => {
  res.send("Eat, enjoy testy food.");
});

app.listen(port, () => {
  console.log(`server is running in port : ${port}`);
});

// rahiurp20
// KVvmwiyZ8BJcOMAM
