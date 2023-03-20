// import { OpenAIStream, OpenAIStreamPayload } from '../../utils/OpenAIStream';

// if (!process.env.OPENAI_API_KEY) {
//   throw new Error('Missing env var from OpenAI');
// }

// export const config = {
//   runtime: 'edge',
// };

// const handler = async (req: Request): Promise<Response> => {
//   const { question } = (await req.json()) as {
//     question?: string;
//   };

//   if (!question) {
//     return new Response('Question cannot be empty', { status: 400 });
//   }

//   const payload: OpenAIStreamPayload = {
//     model: 'gpt-3.5-turbo',
//     messages: [{ role: 'user', content: question }],
//     temperature: 0.7,
//     top_p: 1,
//     frequency_penalty: 0,
//     presence_penalty: 0,
//     max_tokens: 200,
//     stream: true,
//     n: 1,
//   };

//   const stream = await OpenAIStream(payload);
//   return new Response(stream);
// };

// export default handler;
// // Moderate the content to comply with OpenAI T&C
// const moderationResponse = await openAi.createModeration({ input: sanitizedQuery });

// const [results] = moderationResponse.data.results;

// if (results.flagged) {
//   throw new UserError('Flagged content', {
//     flagged: true,
//     categories: results.categories,
//   });
// }
