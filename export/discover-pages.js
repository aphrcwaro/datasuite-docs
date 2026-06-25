const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const config = require("./config");

(async () => {
    console.log("\n========================================");
    console.log(" Discovering documentation structure");
    console.log("========================================\n");

    const browser = await chromium.launch({
        headless: true
    });

    const page = await browser.newPage({
        viewport: config.viewport
    });

    const startUrl = `${config.siteUrl}/${config.language}`;

    console.log(`Opening ${startUrl}\n`);

    await page.goto(startUrl, {
        waitUntil: "networkidle",
        timeout: 120000
    });

    // ---------------------------------------------------
    // Expand every collapsed sidebar section
    // ---------------------------------------------------

    let expanded;

    do {

        expanded = await page.evaluate(() => {

            const buttons = [
                ...document.querySelectorAll("button")
            ];

            let count = 0;

            buttons.forEach(button => {

                const expandedState = button.getAttribute("aria-expanded");

                if (expandedState === "false") {
                    button.click();
                    count++;
                }

            });

            return count;

        });

        if (expanded > 0) {

            await page.waitForTimeout(400);

        }

    } while (expanded > 0);

    // ---------------------------------------------------
    // Collect sidebar links
    // ---------------------------------------------------

    const pages = await page.evaluate(() => {

        const links = [
            ...document.querySelectorAll("aside a")
        ];

        const seen = new Set();

        const output = [];

        for (const link of links) {

            const href = link.getAttribute("href");

            if (!href)
                continue;

            if (!href.startsWith("/en"))
                continue;

            if (href.includes("#"))
                continue;

            if (seen.has(href))
                continue;

            seen.add(href);

            output.push({

                title: link.textContent.trim(),

                url: href

            });

        }

        return output;

    });

    pages.forEach((p, i) => {

        console.log(
            `${String(i + 1).padStart(3)}  ${p.url}`
        );

    });

    fs.mkdirSync(config.tempDir, {
        recursive: true
    });

    fs.writeFileSync(
        path.join(config.tempDir, "contents.json"),
        JSON.stringify(pages, null, 2)
    );

    console.log("\n----------------------------------------");
    console.log(`Discovered ${pages.length} pages`);
    console.log(
        `Saved ${path.join(config.tempDir, "contents.json")}`
    );

    await browser.close();

})();