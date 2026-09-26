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
    title: 'DataSuite Apps',
    theme: {
      copyPage: false,
      toc: false
    }
  },
  troubleshooting: {
    type: 'page',
    title: 'FAQs',
    theme: {
      copyPage: false,
      toc: true,
      layout: 'full'
    }
  },
  resources: {
    type: 'page',
    title: 'Resources',
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
    title: 'Downloads'
  },
  'thank-you': {
    type: 'page',
    display: 'hidden',
    theme: {
      copyPage: false,
      toc: false
    },
    title: 'Thank You'
  }
}
