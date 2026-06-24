const fs = require("fs");
const glob = require("glob");

// English documentation only
const files = glob.sync("src/content/en/**/*.mdx");

let output = "# Datasuite Documentation\n\n";

files.sort().forEach((file) => {
  let content = fs.readFileSync(file, "utf8");

  content = content
  .replace(/^---[\s\S]*?---/gm, "")   // Remove frontmatter
  .replace(/^import .*$/gm, "")   // Remove import statements
  .replace(/^export .*$/gm, "")   // Remove export statements
  .replace(/!\[.*?\]\(.*?\)/g, "")  // Remove image references
  //Replace Unicode symbols
  .replace(/≥/g, ">=")
  .replace(/≤/g, "<=")
  .replace(/→/g, "->")
  .replace(/←/g, "<-")
  .replace(/×/g, "x")
  .replace(/–/g, "-")
  .replace(/—/g, "-")
  // Remove JSX tags
  .replace(/<[^>]+>/g, "") 
  .replace(/<Callout[\s\S]*?<\/Callout>/g, "")
  .replace(/<Steps[\s\S]*?<\/Steps>/g, "")
  .replace(/<HomeCards[\s\S]*?<\/HomeCards>/g, "")
    // Remove LaTex formular
   .replace(/\\times/g, " x ")
  .replace(/\\left/g, "")
  .replace(/\\right/g, "")
  .replace(/N_\{reported\}/g, "N_reported")
  .replace(/_\{/g, "(")
  .replace(/\}/g, ")");
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
