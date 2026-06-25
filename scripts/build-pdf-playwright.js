const { chromium } = require("playwright");

(async () => {

  const browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage({
    viewport: {
      width: 1400,
      height: 1000
    }
  });

  console.log("Opening documentation...");

  await page.goto(
    "http://localhost:3000/en",
    {
      waitUntil: "networkidle",
      timeout: 120000
    }
  );

  console.log("Generating PDF...");

  await page.pdf({
    path: "pdf/output/datasuite-documentation.pdf",
    format: "A4",
    printBackground: true,
    displayHeaderFooter: false,
    margin: {
      top: "15mm",
      bottom: "15mm",
      left: "12mm",
      right: "12mm"
    }
  });

  await browser.close();

  console.log("PDF created.");

})();