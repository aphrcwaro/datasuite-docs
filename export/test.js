// export/test.js

const logger = require("./logger");
const config = require("./config");

logger.info("Starting exporter...");
logger.success("Configuration loaded.");
logger.warn("This is a warning.");
logger.error("This is a test error.");

console.log(config);