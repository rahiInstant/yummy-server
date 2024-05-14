const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT | 5000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@foodnest.clyvw7v.mongodb.net/?retryWrites=true&w=majority&appName=foodNest`;

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    const yummyDB = client.db("foodNest");
    const foodCollection = yummyDB.collection("food");

    app.post("/jwt", async (req, res) => {
      console.log("thank you");
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "1h",
      });
      res
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .send({ success: true });
    });
    app.post("/out", async (req, res) => {
      console.log(req.body);
      res
        .clearCookie("access_token", { httpOnly: true, maxAge: 0 })
        .send({ logout: true });
    });
    app.post("/add-food", async (req, res) => {
      const foodInfo = req.body;
      const result = await foodCollection.insertOne(foodInfo);
      res.send(result);
    });
    app.get("/get-food", async (req, res) => {
      const query = {};
      const option = {
        projection: { name: 1, photo: 1, category: 1, price: 1, quantity: 1 },
      };
      const result = await foodCollection.find(query, option).toArray();
      res.send(result);
    });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
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
