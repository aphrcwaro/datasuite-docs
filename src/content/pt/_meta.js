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
    title: 'Documentação',
    theme: {
      copyPage: false,
      toc: false
    }
  },
  apps: {
    type: 'page',
    title: 'Aplicações DataSuite',
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
    title: 'Recursos',
    theme: {
      copyPage: false,
      toc: false
    }
  },
  downloads: {
    type: 'page',
    display: 'hidden',
    theme: {
      layout: 'full',
      copyPage: false,
      toc: false
    },
    title: 'Transferências'
  },
  'thank-you': {
    type: 'page',
    display: 'hidden',
    theme: {
      copyPage: false,
      toc: false
    },
    title: 'Obrigado'
  }
}
