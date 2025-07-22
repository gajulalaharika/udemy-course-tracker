# Udemy Course Tracker 📚

A full-stack web app to track and categorize Udemy courses with drag-and-drop, search, and notes. Built using the MERN stack (MongoDB, Express, React, Node.js).

## ✨ Features

- 🔍 Auto-fetch course details (title, category, duration) from Udemy URLs
- 🧠 Scrapes course category and estimated completion time
- 🏷️ Automatically organizes courses into categories
- 🖱️ Drag-and-drop interface to organize courses into categories
- 📝 Add personal notes to each course
- 💾 Save all changes to MongoDB
- 🧼 Automatically removes empty category columns
- 🔁 Optional: manually rescrape data via API

---

## 🖼️ Demo

Live: [https://udemy-course-tracker.netlify.app](https://udemy-course-tracker.netlify.app)

> Note: This app requires a valid Udemy access token to fetch real data.

## 🧱 Project Structure

udemy_courses_list/
├── client/ # React frontend
├── server/ # Node.js + Express backend
└── README.md

## 🛠 Tech Stack

- Frontend: React + TypeScript + @hello-pangea/dnd
- Backend: Node.js + Express + MongoDB
- Scraping: Puppeteer (with session cookies) + p-limit
- Database: MongoDB + Mongoose

## 🧪 Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/udemy-course-tracker.git
   ```
2. Install dependencies:

cd client
npm install

cd ../server
npm install

3. Create a .env file in /server:

MONGO_URI=your_mongodb_connection
UDEMY_ACCESS_TOKEN=your_udemy_token

4. Run locally:

cd server
npm start

cd ../client
npm start

📦 API Endpoints
| Method | Endpoint | Description |
| ------ | ----------------- | ------------------ |
| GET | /api/courses | Fetch all courses |
| POST | /api/courses | Add a new course |
| PUT | /api/courses/\:id | Update course info |
| DELETE | /api/courses/\:id | Delete a course |

## 🪪 License

This project is licensed under the [MIT License](LICENSE).

🙋‍♂️ Author
Laharika Gajula

GitHub: yourusername

Feel free to fork, clone, or contribute!
