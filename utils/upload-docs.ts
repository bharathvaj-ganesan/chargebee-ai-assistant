#!/usr/bin/env node
import * as dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';
import * as cheerio from 'cheerio';
import chalk from 'chalk';
import { createClient } from '@supabase/supabase-js';
import { exit } from 'process';

dotenv.config();

const client = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  key: process.env.SUPABASE_ANON_KEY,
};

if (!client.url || !client.key) {
  console.error(chalk.redBright('Missing Supabase Credentials'));
  exit(1);
}

const supabaseClient = createClient(client.url!, client.key!);

const DOM_CONTAINER = '#cb-content';
const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openAi = new OpenAIApi(configuration);
const [content] = process.argv.slice(2);
const urls = content.split(',');

export default async function upload(urls: string[]) {
  const documents = await getDocuments(urls);

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
    const docsContent = $(DOM_CONTAINER).text();

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
