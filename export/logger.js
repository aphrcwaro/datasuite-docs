const fs = require("fs");
const path = require("path");

const config = require("./config");
const constants = require("./constants");

const logFile = path.join(
    config.tempDir,
    constants.LOG_FILE
);

function ensureDirectory() {

    if (!fs.existsSync(config.tempDir)) {
        fs.mkdirSync(config.tempDir, {
            recursive: true
        });
    }

}

function write(level, message) {

    ensureDirectory();

    const line =
        `[${new Date().toISOString()}] ${level}: ${message}`;

    fs.appendFileSync(
        logFile,
        line + "\n"
    );

}

function colour(colourCode, message) {

    return `\x1b[${colourCode}m${message}\x1b[0m`;

}

module.exports = {

    info(message) {

        console.log(
            colour(36, message)
        );

        write(
            "INFO",
            message
        );

    },

    success(message) {

        console.log(
            colour(32, message)
        );

        write(
            "SUCCESS",
            message
        );

    },

    warn(message) {

        console.log(
            colour(33, message)
        );

        write(
            "WARNING",
            message
        );

    },

    error(message) {

        console.log(
            colour(31, message)
        );

        write(
            "ERROR",
            message
        );

    }

};