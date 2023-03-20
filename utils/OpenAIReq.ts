const token = process.env.OPENAI_API_KEY ?? '';

export const fetchCompletions = (payload: any) =>
  fetch('https://api.openai.com/v1/chat/completions', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const fetchModerations = async (payload: any) => {
  const response = await fetch('https://api.openai.com/v1/moderations', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.json();
};

export const fetchEmbeddings = async (payload: any) => {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.json();
};
