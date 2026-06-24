const fs = require("fs");
const glob = require("glob");

// English documentation only
const files = glob.sync("src/content/en/**/*.mdx");

let output = "# Datasuite Documentation\n\n";

files.sort().forEach((file) => {
  let content = fs.readFileSync(file, "utf8");

  content = content
  // Remove frontmatter
  .replace(/^---[\s\S]*?---/gm, "")

  // Remove import statements
  .replace(/^import .*$/gm, "")

  // Remove export statements
  .replace(/^export .*$/gm, "")

  // Remove JSX tags
  .replace(/<[^>]+>/g, "");
  
content = content
  .replace(/<Callout[\s\S]*?<\/Callout>/g, "")
  .replace(/<Steps[\s\S]*?<\/Steps>/g, "")
  .replace(/<HomeCards[\s\S]*?<\/HomeCards>/g, "");
  output += content + "\n\n";
});

// Create output directory if it doesn't exist
const outputDir = "pdf/output";

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(
  "pdf/output/datasuite-book.md",
  output
);

console.log(
  `Processed ${files.length} MDX files and created datasuite-book.md`
);
