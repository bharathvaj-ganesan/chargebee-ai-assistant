# [Chargebee AI Assistant](https://www.chargebee.com/docs/2.0/index.html)

> Answers anything about Chargebee documents in seconds.

An Experimental Project that adds AI Support to Chargebee DOCs.

## How it works

This app uses embeddings to generate a vector representation of a document, and then uses vector search to find the most similar documents to the query. The results of the vector search are then used to construct a prompt for GPT-3, which is then used to generate a response. The response is then streamed to the user.

Technologies used:

- OpenAI API (for generating embeddings and GPT-3 responses)
- Nextjs (React framework) + Vercel hosting
- Supabase (using their pgvector implementation as the vector database)
- TailwindCSS (for styling)

## Running Locally

### Set up Infra

- We will use [Supabase](https://supabase.com/) for the infra setup.
- Create a Supabase account and project at https://app.supabase.com/sign-in. NOTE: Supabase support for pgvector is relatively new (02/2023), so it's important to create a new project if your project was created before then.
- First we'll enable the Vector extension. In Supabase, this can be done from the web portal through `Database` → `Extensions`. You can also do this in SQL by running:

```
create extension vector;
```

- Create `documents` table to store docs and their embeddings. Head over to the SQL Editor and run the following query:

```sql
create table documents (
  id bigserial primary key,
  content text,
  url text,
  embedding vector (1536)
);
```

- Head over to the SQL Editor and run the following query, to create a supabase SQL function that will be used to perform similarity searches.

```sql
create or replace function match_documents (
  query_embedding vector(1536),
  similarity_threshold float,
  match_count int,
  min_content_length int
)
returns table (
  id bigint,
  content text,
  url text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.url,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where length(documents.content) >= min_content_length
  and 1 - (documents.embedding <=> query_embedding) > similarity_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

After cloning the repo, follow the below instructions.

1. Copy .env file

```bash
cp .env.local.example .env.local
```

Copy the Open AI Token and Supabase Credentials and update the `.env.local`

2. Install Dependencies and start the server

```bash
npm install
npm run dev
```

Application should be now available at `http://localhost:3000`. 🎉

## References:

- https://vercel.com/blog/gpt-3-app-next-js-vercel-edge-functions
- https://supabase.com/blog/openai-embeddings-postgres-vector
- https://twitter.com/nutlope/status/1635863041135767554?s=20
