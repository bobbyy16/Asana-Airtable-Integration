const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome!");
});

const PORT = process.env.PORT || 3000;

const asanaRoutes = require("./routes/asana.routes.js");

app.use("/api", asanaRoutes);

app.listen(PORT, () =>
  console.log(`App is listening at http://localhost:${PORT}`)
);
