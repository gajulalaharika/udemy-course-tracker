//This is used to run for scraping courses manually again even when token is not changed
const mongoose = require("mongoose");
const Course = require("./models/Course");

(async () => {
  await mongoose.connect("mongodb://localhost:27017/udemy_courses");

  const courses = await Course.find();

  for (const course of courses) {
    const hasScraped = !!course.scrapedCategory;
    const alreadyInArray = course.categories?.includes(course.scrapedCategory);

    if (hasScraped && !alreadyInArray) {
      course.categories = [
        ...(course.categories || []),
        course.scrapedCategory,
      ];
      await course.save();
      console.log(`✅ Fixed: ${course.title}`);
    }
  }

  console.log("🎉 All old courses now linked to their scraped category.");
  mongoose.disconnect();
})();
