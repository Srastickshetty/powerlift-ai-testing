const express = require("express");
const cors = require("cors");

const coachRoutes = require("./routes/coachRoutes");
const userRoutes = require("./routes/users");
const logRoutes = require("./routes/logs");
const programRoutes = require("./routes/programs");
const progressRoutes = require("./routes/progressRoutes");
const statusRoutes = require("./routes/status");
const competitionRoutes = require("./routes/competition");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ✅ ROUTES (ONCE, CLEAN)
app.use("/api/users", userRoutes);
app.use("/api/coach", coachRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/competition", competitionRoutes);

app.get("/", (req, res) => {
  res.send("Powerlift AI Backend Running");
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
