
const { PDFDocument, rgb, PDFName, PDFDict, PDFArray, PDFNumber } = require('pdf-lib');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');


const BASE_URL = 'http://localhost:3000';
const OUTPUT_FILE = path.join(process.cwd(), 'datasuite-documentation.pdf');

// ==========================================
// 🎨 PRINT SPECIFIC BEAUTIFICATION CSS
// ==========================================
const PRINT_CSS = `
  /* Hide Nextra UI Elements */
  aside, nav, footer, .nextra-toc, .nextra-breadcrumb, button, .nx-edit-link, .nx-copy-button {
    display: none !important;
  }
  /* Normalize Canvas and Typography */
  body, main, article {
    margin: 0 !important; 
    padding: 0 !important;
    max-width: 100% !important; 
    width: 100% !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
    color: #1e293b !important;
    line-height: 1.7 !important;
  }
  /* Force system page breaks smoothly */
  article { page-break-before: always !important; }
  
  /* Elegant Headers */
  h1 { font-size: 28pt !important; color: #0f172a !important; border-bottom: 2px solid #e2e8f0 !important; padding-bottom: 10px; margin-bottom: 20px; }
  h2 { font-size: 20pt !important; color: #334155 !important; margin-top: 30px !important; page-break-inside: avoid !important; }
  h3 { font-size: 16pt !important; color: #475569 !important; page-break-inside: avoid !important; }
  
  /* Beautify Code Blocks */
  pre {
    background-color: #f8fafc !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 8px !important;
    padding: 16px !important;
    font-size: 10pt !important;
    page-break-inside: avoid !important;
    white-space: pre-wrap !important;
    word-break: break-all !important;
  }
  code { background-color: #f1f5f9 !important; padding: 2px 6px !important; border-radius: 4px !important; color: #be123c !important; }
  pre code { background-color: transparent !important; color: inherit !important; padding: 0 !important; }
  
  /* Links & Tables */
  a { color: #2563eb !important; text-decoration: none !important; font-weight: 500 !important; }
  table { width: 100% !important; border-collapse: collapse !important; margin: 20px 0 !important; page-break-inside: avoid !important; }
  th { background-color: #f1f5f9 !important; border: 1px solid #cbd5e1 !important; padding: 10px !important; text-align: left !important; }
  td { border: 1px solid #e2e8f0 !important; padding: 10px !important; }
`;

async function generatePDF() {
  console.log('🚀 Initiating Headless Browser...');
  const browser = await puppeteer.launch({ 
    headless: "new",
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  });
  const page = await browser.newPage();
  
  console.log(`🌐 Mapping Nextra layout hierarchy at ${BASE_URL}...`);
  try {
    await page.goto(`${BASE_URL}/en`, { waitUntil: 'networkidle0', timeout: 30000 });
  } catch (error) {
    console.error(`❌ Could not connect to development server. Ensure your local Nextra engine is running.`);
    await browser.close();
    return;
  }

  const pagesData = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('aside a, nav a'));
    const uniquePages = new Map();

    links.forEach(a => {
      const href = a.getAttribute('href');
      const title = a.innerText.trim();
      if (href && (href.startsWith('/') || href.startsWith('http')) && !href.includes('#') && title) {
        const relativeUrl = href.replace(/^https?:\/\/[^\/]+/, '');
        if (!uniquePages.has(relativeUrl) && relativeUrl.trim() !== '') {
          uniquePages.set(relativeUrl, title);
        }
      }
    });
    return Array.from(uniquePages, ([url, title]) => ({ url, title }));
  });

  if (pagesData.length === 0) {
    console.error('❌ Structure extraction failed. No valid sidebar nodes detected.');
    await browser.close();
    return;
  }

  console.log(`✨ Discovered ${pagesData.length} valid internal paths. Commencing compilation rendering...`);

  let currentTotalPages = 0; 
  const contentPdfs = [];

  // ==========================================
  // 1. RENDER INDIVIDUAL PAGES WITH WEB LINKS
  // ==========================================
  for (let i = 0; i < pagesData.length; i++) {
    const pData = pagesData[i];
    const targetUrl = `${BASE_URL}${pData.url}`;
    console.log(`🖨️  Processing Page [${i + 1}/${pagesData.length}]: ${pData.title}`);

    try {
      await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 30000 });
      await page.addStyleTag({ content: PRINT_CSS });

      // Keep links as explicit, predictable local web targets for Puppeteer to intercept
      await page.evaluate(() => {
        const links = document.querySelectorAll('a[href]');
        links.forEach(link => {
          const href = link.getAttribute('href');
          if (href && (href.startsWith('/') || href.startsWith(window.location.origin))) {
            const targetPath = href.replace(window.location.origin, '').split('#')[0];
            link.setAttribute('href', window.location.origin + targetPath);
          }
        });
      });

      const pageBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '25mm', bottom: '25mm', left: '20mm', right: '20mm' }
      });

      const tempDoc = await PDFDocument.load(pageBuffer);
      const pageCount = tempDoc.getPageCount();

      pData.startPage = currentTotalPages; 
      currentTotalPages += pageCount;

      contentPdfs.push(tempDoc);
    } catch (err) {
      console.error(`❌ Execution dropped on module route [${pData.url}]:`, err.message);
    }
  }

  // ==========================================
  // 2. COMPILE COVER PAGE & DIGITAL INDEX (TOC)
  // ==========================================
  console.log('📑 Re-calculating structural page metrics. Generating Cover & dynamic TOC...');
  
  const roughTocLines = pagesData.length;
  const estimatedTocPages = Math.ceil(roughTocLines / 22); 
  const pageOffsetAdjustment = 1 + estimatedTocPages; 

  const tocHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 45px; color: #1e293b; background: white; }
        .cover { height: 9in; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; page-break-after: always; }
        .cover h1 { font-size: 42pt; color: #0f172a; margin-bottom: 5px; font-weight: 800; letter-spacing: -0.05em; }
        .cover p { font-size: 16pt; color: #475569; margin-top: 5px; }
        .cover .meta { margin-top: 80px; font-size: 10pt; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; }
        
        .toc-container { padding-top: 20px; }
        .toc-header { font-size: 24pt; color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 30px; font-weight: 700; }
        .toc-item { font-size: 12pt; margin-bottom: 14px; display: flex; align-items: baseline; text-decoration: none; color: inherit; cursor: pointer; }
        .toc-title { font-weight: 600; color: #2563eb; text-decoration: none; }
        .toc-title:hover { text-decoration: underline; }
        .toc-dots { flex-grow: 1; border-bottom: 2px dotted #cbd5e1; margin: 0 10px; position: relative; top: -4px; }
        .toc-num { font-weight: 700; color: #0f172a; text-align: right; min-width: 25px; }
      </style>
    </head>
    <body>
      <div class="cover">
        <h1>DataSuite Documentation</h1>
        <p>Official Technical Manual & Core Reference Guide</p>
        <div class="meta">System Platform Copy • Compiled ${new Date().toLocaleDateString()}</div>
      </div>
      
      <div class="toc-container">
        <h2 class="toc-header">Table of Contents</h2>
        ${pagesData.map((p, i) => {
          const targetCalculatedPageNum = p.startPage + pageOffsetAdjustment;
          return `
            <a class="toc-item" href="${BASE_URL}${p.url}">
              <span class="toc-title">${i + 1}. ${p.title}</span>
              <span class="toc-dots"></span>
              <span class="toc-num">${targetCalculatedPageNum}</span>
            </a>
          `;
        }).join('')}
      </div>
    </body>
    </html>
  `;

  await page.setContent(tocHTML, { waitUntil: 'load' });
  const tocBuffer = await page.pdf({ 
    format: 'A4', 
    printBackground: true, 
    margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' } 
  });
  
  const tocPdfDoc = await PDFDocument.load(tocBuffer);

  // ==========================================
  // 3. COMBINE ALL DOCUMENTATION PAGES
  // ==========================================
  const finalMergedPdf = await PDFDocument.create();

  const compiledTocPages = await finalMergedPdf.copyPages(tocPdfDoc, tocPdfDoc.getPageIndices());
  compiledTocPages.forEach(p => finalMergedPdf.addPage(p));

  for (const docItem of contentPdfs) {
    const copiedPages = await finalMergedPdf.copyPages(docItem, docItem.getPageIndices());
    copiedPages.forEach(p => finalMergedPdf.addPage(p));
  }

  // ==========================================
  // 4. POST-PROCESS GLOBAL RUNNING PAGINATION
  // ==========================================
  console.log('✒️ Stamping global consecutive page identifiers onto output stream...');
  const totalBookletPages = finalMergedPdf.getPageCount();
  const systemStandardFont = await finalMergedPdf.embedFont('Helvetica');

  for (let idx = 0; idx < totalBookletPages; idx++) {
    if (idx === 0) continue; 

    const activePage = finalMergedPdf.getPage(idx);
    const { width, height } = activePage.getSize();
    
    const runningFooterText = `DataSuite Documentation — Page ${idx + 1} of ${totalBookletPages}`;
    
    activePage.drawText(runningFooterText, {
      x: width / 2 - (systemStandardFont.widthOfTextAtSize(runningFooterText, 8) / 2),
      y: 25,
      size: 8,
      font: systemStandardFont,
      color: rgb(0.58, 0.64, 0.72)
    });
  }

  // ==========================================
  // 5. 🛠️ LINK REWRITE: TRANSFORMS WEB LINKS TO PDF NATIVE ACTIONS (Defensive Version)
  // ==========================================
  console.log('🔗 Intercepting and rewriting external URLs to native internal PDF destinations...');
  
  const documentPages = finalMergedPdf.getPages();

  for (let idx = 0; idx < documentPages.length; idx++) {
    const currentPage = documentPages[idx];
    if (!currentPage.node.has(PDFName.of('Annots'))) continue;

    // Use lookupMaybe to handle non-primitive or indirect reference wrappers gracefully
    const linkAnnotations = currentPage.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
    if (!linkAnnotations) continue;
    
    for (let j = 0; j < linkAnnotations.size(); j++) {
      // 🛠️ FIX: Safely resolve the raw object context ref instead of throwing on indirect entries
      const annotRef = linkAnnotations.get(j);
      const annot = finalMergedPdf.context.lookupMaybe(annotRef, PDFDict);
      
      // If the annotation object is missing or isn't structurally a link, skip it safely
      if (!annot || annot.lookup(PDFName.of('Subtype')) !== PDFName.of('Link')) continue;

      const action = annot.lookupMaybe(PDFName.of('A'), PDFDict);
      if (!action || action.lookup(PDFName.of('S')) !== PDFName.of('URI')) continue;

      const uriString = action.lookup(PDFName.of('URI')).decodeText();

      // Check if the link points to our local asset target map setup
      if (uriString.startsWith(BASE_URL)) {
        const targetedUrlSlug = uriString.replace(BASE_URL, '');
        
        // Find the matched page layout block index where this slug begins
        const targetPageMatch = pagesData.find(p => p.url === targetedUrlSlug);
        
        if (targetPageMatch) {
          const absoluteTargetPageIndex = targetPageMatch.startPage + pageOffsetAdjustment;
          
          // Guard against indexing anomalies outside bounds
          if (absoluteTargetPageIndex - 1 < documentPages.length) {
            const targetPageObjectRef = documentPages[absoluteTargetPageIndex - 1].ref;

            // Replace the URI network dictionary with a clean internal page jump dictionary (GoTo)
            const localGoToDict = finalMergedPdf.context.obj({
              Type: 'Action',
              S: 'GoTo',
              D: [targetPageObjectRef, 'XYZ', null, null, null] // Preserves viewport scroll position cleanly
            });

            annot.set(PDFName.of('A'), localGoToDict);
          }
        }
      }
    }
  }
  // Save the compiled PDF binary sequence
  const mergedPdfBytes = await finalMergedPdf.save();
  fs.writeFileSync(OUTPUT_FILE, mergedPdfBytes);
  
  console.log(`\n✅ Production Compilation Completed! Interactive Handbook ready at:\n➡️ ${OUTPUT_FILE}`);
  await browser.close();
}

generatePDF();


