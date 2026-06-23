export default {
  index: {
    type: 'page',
    display: 'hidden',
    theme: {
      typesetting: 'article',
      copyPage: false,
      toc: false
    }
  },
  docs: {
    type: 'page',
    title: 'Documentation',
    theme: {
      copyPage: false,
      toc: false
    }
  },
  apps: {
    type: 'page',
    title: 'Applications Datasuite',
    theme: {
      copyPage: false,
      toc: false
    }
  },
  troubleshooting: {
    type: 'page',
    title: 'FAQ',
    theme: {
      copyPage: false,
      toc: true,
      layout: 'full'
    }
  },
  resources: {
    type: 'page',
    title: 'Ressources',
    theme: {
      copyPage: false,
      toc: false
    }
  },
  downloads: {
    type: 'page',
    title: 'Téléchargements',
    display: 'hidden',
    theme: {
      layout: 'full',
      copyPage: false,
      toc: false
    }
  },
  'thank-you': {
    type: 'page',
    title: 'Merci',
    display: 'hidden',
    theme: {
      copyPage: false,
      toc: false
    }
  }
}
