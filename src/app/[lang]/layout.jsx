/* eslint-env node */
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Search } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { locales } from '@/proxy'
import 'nextra-theme-docs/style.css'
import '../../../public/css/custom.css'

export default async function RootLayout({ children, params }) {

  const resolvedParams = await params
  const lang = resolvedParams.lang

  if (!locales.includes(lang)) {
    notFound()
  }

  const translations = {
    en: {
      themeSwitch: { dark: 'Dark', light: 'Light', system: 'System' },
      toc: { title: 'On This Page', backToTop: 'Scroll to top' },
      feedback: { content: 'Question? Give us feedback' },
      searchPlaceholder: 'Search...',
      download: 'Download'
    },
    fr: {
      themeSwitch: { dark: 'Sombre', light: 'Clair', system: 'Système' },
      toc: { title: 'Sur cette page', backToTop: 'Retour en haut' },
      feedback: { content: 'Une question ? Donnez-nous votre avis' },
      searchPlaceholder: 'Rechercher...',
      download: 'Télécharger'
    },
    pt: {
      themeSwitch: { dark: 'Escuro', light: 'Claro', system: 'Sistema' },
      toc: { title: 'Nesta página', backToTop: 'Voltar ao topo' },
      feedback: { content: 'Tem alguma pergunta? Envie-nos seu feedback' },
      searchPlaceholder: 'Pesquisar...',
      download: 'Baixar'
    }
  }

  const t = translations[lang] || translations.en

  try {
    const pageMap = await getPageMap(`/${lang}`)

    return (
      <html lang={lang} dir="ltr" suppressHydrationWarning>
        <body>
          <Layout
            navbar={
            <Navbar 
              logo={
                <>
                  <Image src="/images/suite-icon.svg" alt="DataSuite" width={48} height={48} />
                  <span style={{ marginLeft: '0', fontWeight: 800, fontSize: '24px',  }}>
                    DataSuite
                  </span>
                </>
              }
              align = 'left'
              projectLink={`/${lang}/downloads`}
              projectIcon={<span className="download-btn">{t.download}</span>}
            />
          }
            footer={<Footer>{new Date().getFullYear()} © African Population Health and Research Center.</Footer>}
            docsRepositoryBase="https://github.com/aphrcwaro/datasuite_public"
            sidebar={{ defaultMenuCollapseLevel: 1 }}
            pageMap={pageMap}
            i18n={[
              { locale: 'en', name: 'English' },
              { locale: 'fr', name: 'Français' },
              { locale: 'pt', name: 'Português' }
            ]}
            themeSwitch={t.themeSwitch}
            toc={t.toc}
            feedback={t.feedback}
            editLink={null}
            search={
              <Search 
                placeholder={t.searchPlaceholder} 
              />}
          >
            {children}
          </Layout>
        </body>
      </html>
    )
  } catch (e) {
    notFound()
  }

  
}
