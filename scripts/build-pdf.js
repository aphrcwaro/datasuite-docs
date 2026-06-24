const fs = require("fs");
const glob = require("glob");

const files = glob.sync("src/content/en/**/*.mdx");

const outputFile = "pdf/output/datasuite-book.md";

function cleanContent(content) {
return content


// Frontmatter
.replace(/^---[\s\S]*?---/gm, "")

// Imports / exports
.replace(/^import .*$/gm, "")
.replace(/^export .*$/gm, "")

// Images
.replace(/!\[.*?\]\(.*?\)/g, "")

// HTML comments
.replace(/<!--[\s\S]*?-->/g, "")

// Nextra components
.replace(/<Callout[\s\S]*?<\/Callout>/g, "")
.replace(/<Steps[\s\S]*?<\/Steps>/g, "")
.replace(/<Tabs[\s\S]*?<\/Tabs>/g, "")
.replace(/<Cards[\s\S]*?<\/Cards>/g, "")
.replace(/<Card[\s\S]*?<\/Card>/g, "")
.replace(/<HomeCards[\s\S]*?<\/HomeCards>/g, "")
.replace(/<Details[\s\S]*?<\/Details>/g, "")

// Remaining JSX / HTML
.replace(/<[^>]+>/g, "")

// Unicode normalization
.replace(/≥/g, ">=")
.replace(/≤/g, "<=")
.replace(/→/g, "->")
.replace(/←/g, "<-")
.replace(/⇒/g, "=>")
.replace(/⇐/g, "<=")
.replace(/×/g, "x")
.replace(/÷/g, "/")
.replace(/–/g, "-")
.replace(/—/g, "-")
.replace(/•/g, "-")
.replace(/…/g, "...")
.replace(/′/g, "'")
.replace(/″/g, '"')

// Math delimiters
.replace(/\$\$/g, "")
.replace(/\$/g, "")

// Common LaTeX
.replace(/\\times/g, " x ")
.replace(/\\left/g, "")
.replace(/\\right/g, "")

// Fractions
.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "($1/$2)")

// Text formatting
.replace(/\\text\{([^}]*)\}/g, "$1")
.replace(/\\mathrm\{([^}]*)\}/g, "$1")
.replace(/\\mathbf\{([^}]*)\}/g, "$1")
.replace(/\\operatorname\{([^}]*)\}/g, "$1")

// Greek letters
.replace(/\\alpha/g, "alpha")
.replace(/\\beta/g, "beta")
.replace(/\\gamma/g, "gamma")
.replace(/\\delta/g, "delta")
.replace(/\\theta/g, "theta")
.replace(/\\lambda/g, "lambda")
.replace(/\\mu/g, "mu")
.replace(/\\sigma/g, "sigma")

// Subscripts / superscripts
.replace(/_\{([^}]*)\}/g, "_$1")
.replace(/\^\{([^}]*)\}/g, "^$1")

// Known formulas
.replace(/N_\{reported\}/g, "N_reported")
.replace(/N_\{expected\}/g, "N_expected")

// Remaining LaTeX commands
.replace(/\\[a-zA-Z]+\*?/g, "")

// Remove braces
.replace(/[{}]/g, "")

// Markdown emphasis
.replace(/\*\*/g, "")
.replace(/\*/g, "")

// Excess whitespace
.replace(/\n{4,}/g, "\n\n\n")

.trim();


}

console.log(`Found ${files.length} MDX files`);

let output = "# Datasuite Documentation\n\n";

files.sort().forEach((file) => {
try {
console.log(`Processing ${file}`);


let content = fs.readFileSync(file, "utf8");
content = cleanContent(content);

output += "\n\n\\newpage\n\n";
output += `# Source: ${file}\n\n`;
output += content;
output += "\n\n";

} catch (error) {
console.error(`Error processing ${file}`);
console.error(error);

```
output += `\n\n# Error processing ${file}\n\n`;
output += `${error.message}\n\n`;
```

}
});

const outputDir = "pdf/output";

if (!fs.existsSync(outputDir)) {
fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputFile, output);

console.log(`Created ${outputFile}`);
console.log(`Processed ${files.length} documentation files`);
