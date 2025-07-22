// This file is used to scrape individual course pages from Udemy
// It uses Puppeteer to navigate to the course page and extract details like category and completion time
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const scrapeCoursePage = async (browser, courseUrl, index = 0) => {
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    );

    await page.goto(courseUrl, { waitUntil: "networkidle2", timeout: 0 });
    await new Promise((r) => setTimeout(r, 1000));

    const data = await page.evaluate(() => {
      let ldJsonTag = null;
      const scripts = document.querySelectorAll(
        'script[type="application/ld+json"]'
      );
      for (const el of scripts) {
        try {
          const json = JSON.parse(el.innerText);
          if (json["@graph"]) {
            ldJsonTag = json;
            break;
          }
        } catch (err) {}
      }

      let completionTime = "N/A";
      if (ldJsonTag) {
        const courseNode = ldJsonTag["@graph"].find(
          (n) => n["@type"] === "Course"
        );
        const time = courseNode?.hasCourseInstance?.courseWorkload;
        if (time?.startsWith("PT")) {
          const hours = time.match(/(\d+)H/)?.[1];
          const minutes = time.match(/(\d+)M/)?.[1];
          completionTime =
            (hours ? `${hours} hour${hours !== "1" ? "s" : ""}` : "") +
            (minutes ? ` ${minutes} minute${minutes !== "1" ? "s" : ""}` : "");
        }
      }

      let category = "Uncategorized";
      const breadcrumbs = document.querySelectorAll(
        "nav[aria-label='Breadcrumb'] a"
      );
      if (breadcrumbs.length > 0) {
        category = breadcrumbs[breadcrumbs.length - 1].textContent.trim();
      }

      if (category === "Uncategorized" && ldJsonTag) {
        const courseNode = ldJsonTag["@graph"].find(
          (n) => n["@type"] === "Course"
        );
        const about = courseNode?.about?.name;
        if (Array.isArray(about) && about.length > 0) {
          category = about[about.length - 1];
        }
      }

      return { category, completionTime };
    });

    await page.close();
    return data;
  } catch (err) {
    console.error(`❌ Scraping failed for ${courseUrl}:`, err.message);
    return { category: "Uncategorized", completionTime: "N/A" };
  }
};

module.exports = scrapeCoursePage;
