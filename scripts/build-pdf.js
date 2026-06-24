const fs = require("fs");
const glob = require("glob");

// English documentation only
const files = glob.sync("src/content/en/**/*.mdx");

console.log(`Found ${files.length} MDX files`);

let output = "# Datasuite Documentation\n\n";

files.sort().forEach((file) => {
console.log(`Processing ${file}`);

let content = fs.readFileSync(file, "utf8");

content = content

```
// Remove frontmatter
.replace(/^---[\s\S]*?---/gm, "")

// Remove imports/exports
.replace(/^import .*$/gm, "")
.replace(/^export .*$/gm, "")

// Remove markdown image references
.replace(/!\[.*?\]\(.*?\)/g, "")

// Replace Unicode symbols
.replace(/≥/g, ">=")
.replace(/≤/g, "<=")
.replace(/→/g, "->")
.replace(/←/g, "<-")
.replace(/×/g, "x")
.replace(/–/g, "-")
.replace(/—/g, "-")

// Remove common Nextra components
.replace(/<Callout[\s\S]*?<\/Callout>/g, "")
.replace(/<Steps[\s\S]*?<\/Steps>/g, "")
.replace(/<HomeCards[\s\S]*?<\/HomeCards>/g, "")
.replace(/<Tabs[\s\S]*?<\/Tabs>/g, "")
.replace(/<Cards[\s\S]*?<\/Cards>/g, "")

// Remove remaining JSX tags
.replace(/<[^>]+>/g, "")

// Remove common LaTeX commands
.replace(/\\times/g, " x ")
.replace(/\\left/g, "")
.replace(/\\right/g, "")
.replace(/\\text\{([^}]*)\}/g, "$1")

// Convert known formulas
.replace(/N_\{reported\}/g, "N_reported")

// Remove emphasis markers that frequently break LaTeX
.replace(/\*\*/g, "")
.replace(/\*/g, "");
```

// Add section separator and source filename
output += "\n\n---\n\n";
output += `# Source: ${file}\n\n`;
output += content + "\n\n";
});

// Create output directory if it doesn't exist
const outputDir = "pdf/output";

if (!fs.existsSync(outputDir)) {
fs.mkdirSync(outputDir, { recursive: true });
}

// Write combined markdown file
fs.writeFileSync(
"pdf/output/datasuite-book.md",
output
);

console.log(
`Processed ${files.length} MDX files and created pdf/output/datasuite-book.md`
);
