const path = require("path");

const ROOT = path.resolve(__dirname, "..");

module.exports = {
    language: "en",

    docsRoot: path.join(ROOT, "src", "content"),

    tempDir: path.join(ROOT, "export", "output"),

    cacheDir: path.join(ROOT, "export", "cache"),

    templateDir: path.join(ROOT, "export", "templates"),

    outputDir: path.join(ROOT, "pdf", "output"),

    siteUrl: "http://localhost:3000",

    viewport: {
        width: 1440,
        height: 1000
    },

    pdf: {
        format: "A4",

        printBackground: true,

        displayHeaderFooter: true,

        margin: {
            top: "20mm",
            bottom: "20mm",
            left: "18mm",
            right: "18mm"
        },

        headerTemplate: `
            <div style="font-size:9px;width:100%;text-align:center;color:#888;">
                Datasuite Documentation
            </div>
        `,

        footerTemplate: `
            <div style="font-size:9px;width:100%;padding:0 20px;color:#888;">
                <span class="pageNumber"></span> /
                <span class="totalPages"></span>
            </div>
        `
    }
};