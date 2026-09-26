import nextra from 'nextra'

const withNextra = nextra({
  latex: true,
  search: {
    codeblocks: false
  },
  defaultShowCopyCode: false
})

export default withNextra({
  reactStrictMode: true,
  // Static export: the site is plain files served by the web server (no Node process in production). Languages are
  // path prefixes (/en, /fr, /pt) generated from the [lang] route; "/" is sent to the right one by the web server.
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // Read by Nextra to generate the per-language routes (it removes the key before Next.js sees it).
  i18n: {
    locales: ['en', 'fr', 'pt'],
    defaultLocale: 'en'
  }
})
