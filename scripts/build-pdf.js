const fs = require("fs");
const path = require("path");
const glob = require("glob");

const files = glob.sync("content/**/*.mdx");

let output = "# Datasuite Documentation\n\n";

files.sort().forEach(file => {
  let content = fs.readFileSync(file, "utf8");

  content = content
    .replace(/import .*?;/g, "")
    .replace(/<[^>]+>/g, "");

  output += content + "\n\n";
});

fs.writeFileSync("pdf/output/datasuite-book.md", output);