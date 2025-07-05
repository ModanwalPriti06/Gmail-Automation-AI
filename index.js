const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const emailRoutes = require("./routes/emailRoutes");
const mongoose = require("mongoose");
const runFollowUpJob = require("./cron/followUpJob");
const cors = require('cors');


dotenv.config();
const app = express();
app.use(cors()); 

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("MongoDB connected.");
  runFollowUpJob(); // start cron job
})
.catch((err) => console.log("DB error:", err));


app.use(bodyParser.json());
app.use("/api/email", emailRoutes);

app.get("/", (req, res) => {
  res.send("Gmail Workflow MCP Server is running.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
