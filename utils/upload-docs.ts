#!/usr/bin/env node
require('dotenv').config();
const { Configuration, OpenAIApi } = require('openai');
const cheerio = require('cheerio');
const chalk = require('chalk');
const { createClient } = require('@supabase/supabase-js');

const client = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  key: process.env.SUPABASE_ANON_KEY,
};

if (!client.url || !client.key) {
  console.error(chalk.redBright('Missing Supabase Credentials'));
  process.exit(1);
}

const supabaseClient = createClient(client.url!, client.key!);

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openAi = new OpenAIApi(configuration);
const [content] = process.argv.slice(2);
const urls = content.split(',');

async function upload(urls: string[]) {
  const documents = await getDocuments(urls);

  if (!documents.length) {
    console.error(chalk.redBright('Sorry, unable to find the main content in the url provided'));
    process.exit(1);
  }

  for (const { url, body } of documents) {
    const input = body.replace(/\n/g, ' ');

    const embeddingResponse = await openAi.createEmbedding({
      model: 'text-embedding-ada-002',
      input,
    });

    const [{ embedding }] = embeddingResponse.data.data;

    await supabaseClient.from('documents').insert({
      content: input,
      embedding,
      url,
    });
  }
}

async function getDocuments(urls: string[]) {
  const documents = [];
  for (const url of urls) {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    const docsContent = $('#cb-content').text() || $('.content__default').text();

    let start = 0;
    while (start < docsContent.length) {
      const end = start + 1000;
      const chunk = docsContent.slice(start, end);
      documents.push({ url, body: chunk });
      start = end;
    }
  }
  return documents;
}

upload(urls)
  .then(() => {
    console.log(chalk.greenBright(`Successfully added the content in the provided ${urls.length} pages as embeddings`));
  })
  .catch((err) => {
    console.error(chalk.redBright(err.message || 'Something went wrong'));
  });
