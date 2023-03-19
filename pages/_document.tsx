import Document, { Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <meta name="description" content="Answers anything about Chargebee documents in seconds." />
          <meta property="og:site_name" content="chargebee-docs-ai.bharathvaj.me" />
          <meta property="og:description" content="Answers anything about Chargebee documents in seconds." />
          <meta property="og:title" content="Chargebee AI Assistant" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Chargebee AI Assistant" />
          <meta name="twitter:description" content="Answers anything about Chargebee documents in seconds." />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
