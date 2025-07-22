const axios = require("axios");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const pLimit = require("p-limit").default;
const fs = require("fs");
const path = require("path");
const Course = require("./models/Course");
const scrapeCoursePage = require("./scrapeCoursePage");

puppeteer.use(StealthPlugin());
const tokenFilePath = path.join(__dirname, "lastToken.txt");

const fetchUdemyCourses = async ({ forceRescrape = false } = {}) => {
  const token = process.env.UDEMY_ACCESS_TOKEN;
  if (!token) {
    console.error("❌ UDEMY_ACCESS_TOKEN missing");
    return;
  }

  // 🔐 Load last token
  let lastToken = "";
  if (fs.existsSync(tokenFilePath)) {
    lastToken = fs.readFileSync(tokenFilePath, "utf8").trim();
  }

  const courseCount = await Course.countDocuments();
  const tokenUnchanged = token === lastToken;

  if (!forceRescrape && tokenUnchanged && courseCount > 0) {
    console.log(
      ` Token unchanged and courses exist — skipping scrape and course count: ${courseCount}`
    );
    return;
  }

  // 💾 Save current token
  fs.writeFileSync(tokenFilePath, token);

  let allCourses = [];
  let nextPageUrl = "https://www.udemy.com/api-2.0/users/me/subscribed-courses";

  try {
    console.log("📦 Fetching Udemy course list...");
    while (nextPageUrl) {
      const res = await axios.get(nextPageUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const courses = res.data.results;
      for (const course of courses) {
        allCourses.push({
          id: course.id,
          title: course.title,
          url: `https://www.udemy.com/course/${course.id}`,
        });
      }

      nextPageUrl = res.data.next || null;
    }

    console.log(`✅ Fetched ${allCourses.length} courses`);

    const existingCourses = await Course.find({}, "url");
    const existingUrls = new Set(existingCourses.map((c) => c.url));
    const toScrape = forceRescrape
      ? allCourses
      : allCourses.filter((c) => !existingUrls.has(c.url));

    console.log(`🔍 Need to scrape ${toScrape.length} new courses`);

    const batchSize = 75;
    for (let i = 0; i < toScrape.length; i += batchSize) {
      const batch = toScrape.slice(i, i + batchSize);
      const enriched = await enrichCourseDetails(batch);

      await Promise.all(
        enriched.map(async (course) => {
          await Course.updateOne(
            { url: course.url },
            {
              $set: {
                title: course.title,
                completionTime: course.completionTime,
                scrapedCategory: course.scrapedCategory,
              },
              $addToSet: { categories: course.scrapedCategory },
            },
            { upsert: true }
          );
        })
      );

      console.log(`✅ Saved batch ${i / batchSize + 1}`);
    }

    console.log("🎉 All new courses processed and saved to MongoDB");
  } catch (err) {
    console.error("❌ Error fetching Udemy courses:", err.message);
  }
};

const enrichCourseDetails = async (courses) => {
  const limit = pLimit(10);
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
    ],
  });

  const enriched = [];
  await Promise.all(
    courses.map((course, index) =>
      limit(async () => {
        try {
          const { category, completionTime } = await scrapeCoursePage(
            browser,
            course.url,
            index
          );
          enriched.push({
            title: course.title,
            url: course.url,
            scrapedCategory: category,
            completionTime,
            // categories: [category],
          });
        } catch (err) {
          console.error(`❌ Failed scraping ${course.title}: ${err.message}`);
        }
      })
    )
  );

  await browser.close();
  return enriched;
};

module.exports = fetchUdemyCourses;
