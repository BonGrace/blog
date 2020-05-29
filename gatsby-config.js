require("dotenv").config();
const queries = require("./src/utils/algolia");
const config = require("./config");
const { isNil } = require('lodash')
const mapPagesUrls = {
  index: '/',
}
const myPlugin = (lunr) => (builder) => {
  // removing stemmer
  builder.pipeline.remove(lunr.stemmer)
  builder.searchPipeline.remove(lunr.stemmer)
  // or similarity tuning
  builder.k1(1.3)
  builder.b(0)
}
const plugins = [
  'gatsby-plugin-sitemap',
  'gatsby-plugin-sharp',
  {
    resolve: `gatsby-plugin-layout`,
    options: {
        component: require.resolve(`./src/templates/docs.js`)
    }
  },
  'gatsby-plugin-emotion',
  'gatsby-plugin-react-helmet',
  {
    resolve: "gatsby-source-filesystem",
    options: {
      name: "docs",
      path: `${__dirname}/posts`
    }
  },
  {
    resolve: 'gatsby-plugin-mdx',
    options: {
      gatsbyRemarkPlugins: [
        {
          resolve: "gatsby-remark-images",
          options: {
            maxWidth: 1035,
            sizeByPixelDensity: true
          }
        },
        {
          resolve: 'gatsby-remark-copy-linked-files'
        }
      ],
      extensions: [".mdx", ".md"]
    }
  },
  {
    resolve: `gatsby-plugin-gtag`,
    options: {
      // your google analytics tracking id
      trackingId: config.gatsby.gaTrackingId,
      // Puts tracking script in the head instead of the body
      head: true,
      // enable ip anonymization
      anonymize: false,
    },
  },
  {
    resolve: 'gatsby-plugin-lunr',
    options: {
      // ISO 639-1 language codes. See https://lunrjs.com/guides/language_support.html for details
      languages: [{
        // ISO 639-1 language codes. See https://lunrjs.com/guides/language_support.html for details
        name: 'en',
        filterNodes: node => {
          // const myConsole = new console.Console(out, err);
          // myConsole.log('THIS IS CUSTOM TEST OF NODE ' + node.keys().toString())
          // if (node.frontmatter && node.frontmatter.path && node.frontmatter.path.includes('/posts')) {
          //   console.log('-----THIS IS CUSTOM OUTPUT------ nodes' + JSON.stringify(node))
          // }
          return node.frontmatter && node.frontmatter.path && node.frontmatter.path.includes('/posts')
        }
      }, {
        // ISO 639-1 language codes. See https://lunrjs.com/guides/language_support.html for details
        name: 'zh',
        filterNodes: node => {
          // const myConsole = new console.Console(out, err);
          // myConsole.log('THIS IS CUSTOM TEST OF NODE ' + node.keys().toString())
          // if (node.frontmatter && node.frontmatter.path && node.frontmatter.path.includes('/posts')) {
          //   console.log('-----THIS IS CUSTOM OUTPUT------ nodes' + JSON.stringify(node))
          // }
          return node.frontmatter && node.frontmatter.path && node.frontmatter.path.includes('/posts')
        }
      }],
      // Fields to index. If store === true value will be stored in index file.
      // Attributes for custom indexing logic. See https://lunrjs.com/docs/lunr.Builder.html for details
      fields: [
        { name: 'title', store: true, attributes: { boost: 20 } },
        { name: 'description', store: true },
        { name: 'content', store: true },
        { name: 'path', store: true },
        { name: 'url', store: true },
      ],
      // A function for filtering nodes. () => true by default
      filterNodes: (node) => {
        // const myConsole = new console.Console(out, err);
        // myConsole.log('THIS IS CUSTOM TEST OF NODE ' + node.keys().toString())
        return !isNil(node.frontmatter);
      },
      // How to resolve each field's value for a supported node type
      resolvers: {
        // For any node of type MarkdownRemark, list how to resolve the fields' values
        Mdx: {
          title: (node) => node.frontmatter.title,
          description: (node) => node.frontmatter.description,
          content: (node) => node.rawBody,
          url: (node) => node.fields.slug,
        },
      },
    },
  }
];
// check and add algolia
if (config.header.search && config.header.search.enabled && config.header.search.algoliaAppId && config.header.search.algoliaAdminKey) {
  plugins.push({
    resolve: `gatsby-plugin-algolia`,
    options: {
      appId: config.header.search.algoliaAppId, // algolia application id
      apiKey: config.header.search.algoliaAdminKey, // algolia admin key to index
      queries,
      chunkSize: 10000, // default: 1000
    }}
  )
}
// check and add pwa functionality
if (config.pwa && config.pwa.enabled && config.pwa.manifest) {
  plugins.push({
      resolve: `gatsby-plugin-manifest`,
      options: {...config.pwa.manifest},
  });
  plugins.push({
    resolve: 'gatsby-plugin-offline',
    options: {
      appendScript: require.resolve(`./src/custom-sw-code.js`),
    },
  });
} else {
  plugins.push('gatsby-plugin-remove-serviceworker');
}

// check and remove trailing slash
if (config.gatsby && !config.gatsby.trailingSlash) {
  plugins.push('gatsby-plugin-remove-trailing-slashes');
}

module.exports = {
  pathPrefix: config.gatsby.pathPrefix,
  siteMetadata: {
    title: config.siteMetadata.title,
    description: config.siteMetadata.description,
    docsLocation: config.siteMetadata.docsLocation,
    ogImage: config.siteMetadata.ogImage,
    favicon: config.siteMetadata.favicon,
    logo: { link: config.header.logoLink ? config.header.logoLink : '/', image: config.header.logo }, // backwards compatible
    headerTitle: config.header.title,
    githubUrl: config.header.githubUrl,
    helpUrl: config.header.helpUrl,
    tweetText: config.header.tweetText,
    headerLinks: config.header.links,
    siteUrl: config.gatsby.siteUrl,
  },
  plugins: plugins
};
