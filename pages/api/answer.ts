import { createClient } from '@supabase/supabase-js';
import GPT3Tokenizer from 'gpt3-tokenizer';
import { OpenAIStream, OpenAIStreamPayload } from '../../utils/OpenAIStream';
import { fetchEmbeddings, fetchModerations } from '../../utils/OpenAIReq';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing env var from OpenAI');
}

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  const { question } = (await req.json()) as {
    question?: string;
  };

  if (!question) {
    return new Response('Question cannot be empty', { status: 400 });
  }

  const sanitizedQuestion = question.trim().replace(/\n/g, ' ');

  const moderationResponse = await fetchModerations({ input: sanitizedQuestion });

  const [results] = moderationResponse.results;

  if (results.flagged) {
    return new Response('Flagged Question', { status: 400 });
  }

  const embeddingResponse = await fetchEmbeddings({
    model: 'text-embedding-ada-002',
    input: sanitizedQuestion,
  });

  const [{ embedding }] = embeddingResponse.data;
  const supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

  const { error: matchError, data: documents } = await supabaseClient.rpc('match_documents', {
    query_embedding: embedding,
    similarity_threshold: 0.78,
    match_count: 10,
    min_content_length: 50,
  });

  if (matchError) {
    return new Response('Sorry something went wrong.', { status: 500 });
  }

  const tokenizer = new GPT3Tokenizer({ type: 'gpt3' });
  let tokenCount = 0;
  let contextText = '';

  for (let i = 0; i < documents.length; i++) {
    const document = documents[i];
    const content = document.content;
    const encoded = tokenizer.encode(content);
    tokenCount += encoded.text.length;

    if (tokenCount >= 1500) {
      break;
    }

    contextText += `${content.trim()}\n---\n`;
  }

  const systemContent = `You are a helpful assistant. When given CONTEXT you answer questions using only that information,
  and you always format your output in markdown. You include code snippets if relevant. If you are unsure and the answer
  is not explicitly written in the CONTEXT provided, you say
  "Sorry, I don't know how to help with that."  If the CONTEXT includes
  source URLs include them under a SOURCES heading at the end of your response. Always include all of the relevant source urls
  from the CONTEXT, but never list a URL more than once (ignore trailing forward slashes when comparing for uniqueness). Never include URLs that are not in the CONTEXT sections. Never make up URLs`;

  const userContent = `CONTEXT:
  Chargebee is the recurring revenue management platform for global scale. Leading companies trust Chargebee to power their full recurring revenue lifecycle, from subscription billing and invoicing to cash, accounting, renewal, and more.
  SOURCE: chargebee.com/docs

  QUESTION:
  What is Chargebee and what does Subscription Billing mean?
  `;

  const assistantContent = `Consider Chargebee as your off-the-shelf plug-&-play billing solution delivered on the cloud. You can connect with Chargebee via API if you are technically inclined or use our PCI compliant hosted payment pages to collect payments, to go-live in minutes.

  SOURCES:
  https://https://www.chargebee.com/faq`;

  const userMessage = `CONTEXT:
  ${contextText}

  USER QUESTION: ${sanitizedQuestion}
  `;

  const messages = [
    {
      role: 'system',
      content: systemContent,
    },
    {
      role: 'user',
      content: userContent,
    },
    {
      role: 'assistant',
      content: assistantContent,
    },
    {
      role: 'user',
      content: userMessage,
    },
  ];

  const payload: OpenAIStreamPayload = {
    model: 'gpt-3.5-turbo',
    messages: messages,
    temperature: 0,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 2000,
    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(payload);
  return new Response(stream);
};

export default handler;
