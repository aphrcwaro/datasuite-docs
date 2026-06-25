module.exports = {

    IGNORE_FILES: [
        "_meta.js",
        "downloads.module.css"
    ],

    IGNORE_EXTENSIONS: [
        ".css",
        ".scss",
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".svg",
        ".ico",
        ".webp",
        ".json"
    ],

    REMOVE_SELECTORS: [

        // Layout
        "header",
        "footer",
        "nav",

        // Nextra
        ".nextra-sidebar",
        ".nextra-toc",
        ".nextra-search",
        ".nextra-nav-container",
        ".nextra-breadcrumb",
        ".nextra-scrollbar",
        ".nextra-mobile-nav",

        // Navigation
        ".pagination",
        ".next-link",
        ".prev-link",

        // GitHub
        ".github-corner",

        // Feedback
        "[data-feedback]",

        // Theme
        "[data-theme-toggle]",

        // Language selector
        "[data-language-switcher]",

        // Edit page
        "[data-edit-page]",

        // Announcement
        ".announcement",

        // Search
        "button[aria-label='Search']"
    ],

    PDF_NAME: "datasuite-documentation.pdf",

    CONTENTS_JSON: "contents.json",

    LOG_FILE: "build.log",

    DEFAULT_TIMEOUT: 120000
};