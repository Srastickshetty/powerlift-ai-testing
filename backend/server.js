const express = require("express");
const cors = require("cors");
const progressRoutes = require("./routes/progressRoutes");
const logRoutes = require("./routes/logRoutes");
const coachRoutes = require("./routes/coachRoutes");
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/api/logs", require("./routes/logs"));
app.use("/api/programs", require("./routes/programs"));
app.use("/api/coach", require("./routes/coach"));
app.use("/api/users", require("./routes/users"));
app.use("/api/status", require("./routes/status"));
app.use("/api/competition", require("./routes/competition"));
app.use("/api/progress", require("./routes/progressRoutes"));
app.use("/api/progress", progressRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/coach", coachRoutes);


app.get("/", (req, res) => {
  res.send("Powerlift AI Backend Running");
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
