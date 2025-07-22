# ⚙️ Backend – Udemy Course Tracker

This is the Express.js backend and Puppeteer scraper for the Udemy Course Tracker project.

---

## 🔍 Features

- Fetches your Udemy course list via API using an access token
- Scrapes individual course pages for:
  - 📂 Category
  - ⏱️ Estimated Completion Time
- Stores all course data in MongoDB
- Supports manual rescrape and note updates

---

## 🛠 API Endpoints

- GET /api/courses – Get all courses from MongoDB
- PUT /api/courses/save – Save category and note updates
- POST /api/courses/rescrape – Manually scrape all courses again

## How Scraping Works

- Uses Puppeteer with Stealth Plugin
- Scrapes category and completion time from each course page
- Avoids re-scraping if token hasn't changed unless forced

## Helpers

- fetchUdemyCourses.js - Fetch & scrape all course data
- scrapeCoursePage.js - Scrape individual course metadata
