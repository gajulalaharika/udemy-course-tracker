const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const Course = require("./models/Course");
const courseRoutes = require("./routes/Courses");
const fetchUdemyCourses = require("./fetchUdemyCourses");

// MongoDB connect
const connectWithRetry = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "udemy_courses",
    });
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

// Routes
app.get("/", (req, res) => {
  res.send("✅ Udemy Tracker backend live and connected!");
});


app.use("/api/courses", courseRoutes);

app.get("/api/courses", async (req, res) => {
  try {
    await fetchUdemyCourses();
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (err) {
    console.error("Error fetching Udemy courses from index:", err.message);
    res
      .status(500)
      .json({ message: "Error fetching courses", error: err.message });
  }
});

// Schedule course updates every 6 hours
cron.schedule("0 */6 * * *", async () => {
  console.log("Cron job triggered: Fetching Udemy courses...");
  await fetchUdemyCourses();
});

// Startup fetch
(async () => {
  console.log("Manual startup Udemy data fetch...");
  await fetchUdemyCourses();
})();

// Launch server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
