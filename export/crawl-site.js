const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const config = require("./config");
const constants = require("./constants");
const logger = require("./logger");

const contents = require(
    path.join(
        config.tempDir,
        constants.CONTENTS_JSON
    )
);

async function ensureDirectory(dir) {
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
}

(async () => {

    await ensureDirectory(config.cacheDir);

    logger.info(`Rendering ${contents.length} pages...`);

    const browser = await chromium.launch({

        headless: true

    });

    const page = await browser.newPage({

        viewport: {
            width: 1600,
            height: 1200
        }

    });

    for (const doc of contents) {

        const url = config.siteUrl + doc.url;

        logger.info(url);

        try {

            await page.goto(url, {

                waitUntil: "networkidle",
                timeout: 120000

            });

            // wait for fonts
            await page.waitForTimeout(1000);

            // wait for images
            await page.evaluate(async () => {

                await Promise.all(

                    [...document.images].map(img => {

                        if (img.complete)
                            return Promise.resolve();

                        return new Promise(resolve => {

                            img.onload = resolve;
                            img.onerror = resolve;

                        });

                    })

                );

            });

            // wait for Mermaid
            await page.waitForTimeout(1000);

            // wait for MathJax
            await page.waitForTimeout(1000);

            const html = await page.content();

            const outfile = path.join(

                config.cacheDir,

                doc.relative
                    .replace(/\//g, "__")
                    .replace(".mdx", ".html")

            );

            fs.writeFileSync(outfile, html);

            logger.success(outfile);

        }

        catch (err) {

            logger.error(url);

            logger.error(err.message);

        }

    }

    await browser.close();

})();