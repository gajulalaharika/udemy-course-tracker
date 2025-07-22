const express = require("express");
const router = express.Router();
const Course = require("../models/Course");

// 🔄 PUT /api/courses/save — Save all edited courses
router.put("/save", async (req, res) => {
  const { updatedCourses } = req.body;
  if (!Array.isArray(updatedCourses))
    return res.status(400).send("Invalid data");

  try {
    await Promise.all(
      updatedCourses.map(async (course) => {
        await Course.updateOne(
          { url: course.url },
          {
            $set: {
              title: course.title,
              completionTime: course.completionTime,
              notes: course.notes || "",
              categories: course.categories || [],
            },
          }
        );
      })
    );
    res.status(200).send("Courses updated successfully");
  } catch (err) {
    console.error("Error saving courses:", err);
    res.status(500).send("Failed to update courses");
  }
});

//Force scraping manually
router.post("/rescrape", async (req, res) => {
  const fetchUdemyCourses = require("../fetchUdemyCourses");

  try {
    await fetchUdemyCourses({ forceRescrape: true });
    res.status(200).send("Rescraped all courses");
  } catch (err) {
    console.error("❌ Error rescraping courses:", err.message);
    res.status(500).send("Failed to rescrape courses");
  }
});

// GET all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

module.exports = router;
