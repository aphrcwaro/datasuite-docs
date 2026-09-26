// The site's languages. Kept separate from any server-side routing so the pages can import it in a static export;
// the language redirect for "/" is done by the web server (see the Caddyfile in the DataSuite deployment).
export const locales = ['en', 'fr', 'pt']
export const defaultLocale = 'en'
