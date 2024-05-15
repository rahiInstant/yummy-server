const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    origin: [
      "http://localhost:5173",
      "https://recipe-net.web.app",
      "https://recipe-net.firebaseapp.com",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
async function logger(req, res, next) {
  console.log("called", req.hostname, req.originalUrl);
  next();
}

const verifyToken = async (req, res, next) => {
  const token = req.cookies["access_token"];
  if (!token) {
    return res.status(401).send({ message: "forbidden" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decode) => {
    if (err) {
      // console.log(err)
      return res.status(401).send({ message: "unauthorized" });
    }
    req.user = decode;
    next();
  });
};

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const cookieObj = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  secure: process.env.NODE_ENV === "production",
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    const yummyDB = client.db("foodNest");
    const foodCollection = yummyDB.collection("food");
    const orderCollection = yummyDB.collection("order");
    const feedCollection = yummyDB.collection("feed");

    app.post("/jwt", async (req, res) => {
      console.log("thank you");
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "1h",
      });
      res.cookie("access_token", token, cookieObj).send({ success: true });
    });
    app.post("/out", async (req, res) => {
      console.log(req.body);
      res
        .clearCookie("access_token", { httpOnly: true, maxAge: 0 })
        .send({ logout: true });
    });
    app.patch("/update-food/:id", logger, verifyToken, async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };
      const item = req.body.itemCount;
      const updateDoc = { $inc: { count: item } };
      const result = await foodCollection.updateOne(query, updateDoc);
      res.send(result);
    });
    app.post("/add-food", logger, verifyToken, async (req, res) => {
      const foodInfo = req.body;
      const result = await foodCollection.insertOne(foodInfo);
      res.send(result);
    });
    app.get("/get-food", async (req, res) => {
      const query = {};
      const option = {
        projection: {
          name: 1,
          photo: 1,
          category: 1,
          price: 1,
          quantity: 1,
          discount: 1,
          count: 1,
        },
      };
      const result = await foodCollection.find(query, option).toArray();
      res.send(result);
    });
    app.get("/get-food-detail/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.findOne(query);
      res.send(result);
    });
    app.post("/purchase", logger, verifyToken, async (req, res) => {
      const orderData = req.body;
      const result = await orderCollection.insertOne(orderData);
      res.send(result);
    });
    app.get("/my-item/:email", logger, verifyToken, async (req, res) => {
      const query = { email: req.params.email };
      const option = {
        projection: {
          name: 1,
          price: 1,
          quantity: 1,
          count: 1,
        },
      };

      const result = await foodCollection.find(query, option).toArray();
      res.send(result);
    });
    app.get("/user-order/:email", logger, verifyToken, async (req, res) => {
      const query = { email: req.params.email };
      const option = {
        projection: {
          name: 1,
          price: 1,
          itemCount: 1,
          date: 1,
        },
      };
      const result = await orderCollection.find(query, option).toArray();
      res.send(result);
    });
    app.post("/feedback", logger, verifyToken, async (req, res) => {
      const feedback = req.body;
      const result = await feedCollection.insertOne(feedback);
      res.send(result);
    });
    app.get("/gallery", async (req, res) => {
      const result = await feedCollection.find().toArray();
      res.send(result);
    });
    // app.put("/update-item/:id", async (req, res) => {

    // });
    app.get("/top-food", async (req, res) => {
      const query = {};
      const option = {
        projection: {
          name: 1,
          photo: 1,
          category: 1,
          price: 1,
          quantity: 1,
          discount: 1,
          count: 1,
        },
      };
      const result = await foodCollection
        .find(query, option)
        .sort({ count: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });
    app.delete("/user-order-delete/:id", async (req, res) => {
      const product = req.params.id;
      const query = { _id: new ObjectId(req.params.id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });
    app.delete("/remove-my-food", async (req, res) => {
      
    });
    app.patch("/update-item/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: { ...req.body },
      };
      const result = await foodCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.post("/handle-search", async (req, res) => {
      const query = { name: req.body.search };
      console.log(query);
      const result = await foodCollection.find(query).toArray();
      res.send(result);
    });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
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
