const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userService = require("./service/user.service");
const { authenticate } = require("./authenticate.middleware");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const { isAdmin } = require("./admin.middleware");
const connectionString = process.env.MONGO_HOST;
const dbName = "recipe-manager";
let db;

const connectDb = async () => {
  try {
    const client = await MongoClient.connect(connectionString);
    db = client.db(dbName);
    await userService.registerModel(db.collection("users"));
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

app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db
      .collection("users")
      .insertOne({ username, password: hashedPassword });
    const token = jwt.sign(
      { userId: result.insertedId },
      process.env.SECRET_KEY,
      { expiresIn: "7days" }
    );
    res.json({ token });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(500).json({ error: "Username taken" });
    }
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.collection("users").findOne({ username });
    if (!user) return res.status(404).json({ error: "Cannot login!" });
    if (!(await bcrypt.compare(password, user.password)))
      return res.status(404).json({ error: "Cannot login!" });
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "7days",
    });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.use(authenticate);

app.get("/api/user-data", async (req, res) => {
  return res.json(req.user);
});

app.get("/api/recipes", async (req, res) => {
  try {
    let { page, title, pageSize, tags } = req.query;
    tags = JSON.parse(tags || "[]");
    pageSize = parseInt(pageSize);
    let query = {};
    if (title) {
      query = { ...query, title: { $regex: title, $options: "i" } };
    }
    if (tags.length) {
      query = { ...query, tags: { $all: tags } };
    }
    const searchQuery = db.collection("recipes").find(query);
    const count = await searchQuery.count();
    const pages = Math.ceil(count / pageSize); // 15 / 5 = 3 pages
    // 14 / 5 = 2.7 ~ 3 pages
    const recipes = await searchQuery
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();
    res.json({ recipes, pages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/recipes", isAdmin, async (req, res) => {
  try {
    const newRecipe = req.body;
    await db.collection("recipes").insertOne(newRecipe);
    res.status(201).json({ message: "Recipe added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/tags", async (req, res) => {
  try {
    const tags = await db.collection("tags").find().toArray();
    res.json(tags);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/tags", isAdmin, async (req, res) => {
  try {
    const { label, value } = req.body;
    if (!label || !value) return res.status(400).json({ error: "Bad Request" });
    const result = await db.collection("tags").insertOne({ label, value });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/tags/:value", isAdmin, async (req, res) => {
  try {
    const value = req.params.value;
    const result = await db.collection("tags").deleteOne({ value });
    res.json(result);
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
