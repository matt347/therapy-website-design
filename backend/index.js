require('dotenv').config({ path: '../.env' });
console.log('Environment check:', {
  mongoDbUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
  openAiKey: process.env.OPENAI_API_KEY ? 'Set' : 'Not set'
});
const { MongoClient } = require('mongodb');

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;

  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db('therapy-website');
  cachedDb = db;
  return db;
}

const THERAPIST_PROMPT = `
Eliza Sparkes is a licensed independent clinical social worker with 8+ years experience.
Specialties include:
Depression
Anxiety
Impacts of trauma
Gender identity and sexuality
White folks confronting and unlearning racism
Improving interpersonal relationships
Family issues
Impacts of political environment
`;

async function analyzeClientMatch(issuesText) {
  const model = 'google/flan-t5-small';

  const prompt = `${THERAPIST_PROMPT}
Client's presenting issues:
${issuesText}
Based on the therapist's specialties and the client's issues, provide a brief assessment of the potential match. 
Consider alignment with specialties, experience, and approach. Keep response under 50 words. Respond as if you are Eliza Sparkes`;

  const res = await fetch(`https://openrouter.ai/api/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "model": "deepseek/deepseek-chat-v3.1:free",
      "messages": [
        {
          "role": "user",
          "content": prompt
        }
      ]
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HF inference error: ${res.status} ${text}`);
  }

  const json = await res.json();
  let txt = '';
  if (json?.choices && Array.isArray(json.choices) && json.choices.length > 0) {
    txt = json.choices[0].message?.content ?? json.choices[0].text ?? '';
    return (txt || '').trim();

  }
}

// Export the serverless function handler
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = await connectToDatabase();

    const inquiry = {
      ...req.body,
      timestamp: new Date(),
      status: 'new'
    };

    await db.collection('clients.client_data').insertOne(inquiry);
    const match_analysis = await analyzeClientMatch(req.body.issues);

    return res.status(200).json({
      message: 'Inquiry submitted successfully',
      match_analysis
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      message: 'Error processing inquiry',
      error: error.message
    });
  }
};