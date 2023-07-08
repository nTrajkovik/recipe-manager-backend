const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const connectionString = process.env.MONGO_HOST;
const dbName = "recipe-manager";
let db;

const connectDb = async () => {
  try {
    const client = await MongoClient.connect(connectionString);
    db = client.db(dbName);
    console.log("Connection to Mongo Success");
  } catch (err) {
    console.error(err);
  }
};

const port = process.env.PORT;
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    res.json({ success: "Connected" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});


app.get("/api/recipes", async (req, res) => {
  try {
    const { page } = req.query;
    const pageSize = 10;
    const recipes = await db.collection('recipes')
    .find()
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray();
    res.json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/recipes", async (req, res) => {
  try {
    const newRecipe = req.body;
    await db.collection('recipes').insertOne(newRecipe);
    res.status(201).json({ message: 'Recipe added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

const startServer = () => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

connectDb().then(startServer);
