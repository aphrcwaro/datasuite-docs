const fs = require("fs");
const glob = require("glob");

// ============================================================================
// Configuration
// ============================================================================

// English documentation only
const files = glob.sync("src/content/en/**/*.mdx");

// Output markdown
const outputFile = "pdf/output/datasuite-book.md";

// ============================================================================
// Helpers
// ============================================================================

function cleanContent(content) {
return content

```
// ------------------------------------------------------------------------
// Remove MDX frontmatter
// ------------------------------------------------------------------------
.replace(/^---[\s\S]*?---/gm, "")

// ------------------------------------------------------------------------
// Remove imports and exports
// ------------------------------------------------------------------------
.replace(/^import .*$/gm, "")
.replace(/^export .*$/gm, "")

// ------------------------------------------------------------------------
// Remove markdown images
// ------------------------------------------------------------------------
.replace(/!\[.*?\]\(.*?\)/g, "")

// ------------------------------------------------------------------------
// Remove HTML comments
// ------------------------------------------------------------------------
.replace(/<!--[\s\S]*?-->/g, "")

// ------------------------------------------------------------------------
// Remove common Nextra components
// ------------------------------------------------------------------------
.replace(/<Callout[\s\S]*?<\/Callout>/g, "")
.replace(/<Steps[\s\S]*?<\/Steps>/g, "")
.replace(/<Tabs[\s\S]*?<\/Tabs>/g, "")
.replace(/<Cards[\s\S]*?<\/Cards>/g, "")
.replace(/<Card[\s\S]*?<\/Card>/g, "")
.replace(/<HomeCards[\s\S]*?<\/HomeCards>/g, "")
.replace(/<Details[\s\S]*?<\/Details>/g, "")

// ------------------------------------------------------------------------
// Remove remaining JSX tags
// ------------------------------------------------------------------------
.replace(/<[^>]+>/g, "")

// ------------------------------------------------------------------------
// Unicode normalization
// ------------------------------------------------------------------------
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

// ------------------------------------------------------------------------
// Common LaTeX cleanup
// ------------------------------------------------------------------------
.replace(/\$\$/g, "")
.replace(/\$/g, "")

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

// Common Greek symbols
.replace(/\\alpha/g, "alpha")
.replace(/\\beta/g, "beta")
.replace(/\\gamma/g, "gamma")
.replace(/\\delta/g, "delta")
.replace(/\\theta/g, "theta")
.replace(/\\lambda/g, "lambda")
.replace(/\\mu/g, "mu")
.replace(/\\sigma/g, "sigma")

// Superscripts and subscripts
.replace(/_\{([^}]*)\}/g, "_$1")
.replace(/\^\{([^}]*)\}/g, "^$1")

// Known formulas
.replace(/N_\{reported\}/g, "N_reported")
.replace(/N_\{expected\}/g, "N_expected")

// Remove any remaining LaTeX commands
.replace(/\\[a-zA-Z]+\*?/g, "")

// Remove orphan braces
.replace(/[{}]/g, "")

// ------------------------------------------------------------------------
// Markdown cleanup
// ------------------------------------------------------------------------
.replace(/\*\*/g, "")
.replace(/\*/g, "")

// Collapse excessive blank lines
.replace(/\n{4,}/g, "\n\n\n")

.trim();
```

}

// ============================================================================
// Main
// ============================================================================

console.log(`Found ${files.length} MDX files`);

let output = "# Datasuite Documentation\n\n";

files.sort().forEach((file) => {
try {
console.log(`Processing ${file}`);

```
let content = fs.readFileSync(file, "utf8");

content = cleanContent(content);

output += "\n\n";
output += "---\n\n";
output += `# Source: ${file}\n\n`;
output += content;
output += "\n\n";
```

} catch (error) {
console.error(`Error processing ${file}`);
console.error(error);

```
output += "\n\n";
output += `# Error processing ${file}\n\n`;
output += `${error.message}\n\n`;
```

}
});

// ============================================================================
// Create output directory
// ============================================================================

const outputDir = "pdf/output";

if (!fs.existsSync(outputDir)) {
fs.mkdirSync(outputDir, { recursive: true });
}

// ============================================================================
// Write output
// ============================================================================

fs.writeFileSync(outputFile, output);

console.log(`Created ${outputFile}`);
console.log(`Processed ${files.length} documentation files`);
