const express = require("express");
const cors = require('cors');
require('dotenv').config();
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

app.get("/hi", async (req, res) => {
  try {
    res.json({ success: "Hi!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})