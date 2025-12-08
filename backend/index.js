require('dotenv').config({ path: '../.env' });
const { MongoClient } = require('mongodb');

const passport = require('./auth');
const session = require('express-session'); 
const bodyParser = require('body-parser'); 
const parseJson = bodyParser.json();
const jwt = require('jsonwebtoken');


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
      "model": "amazon/nova-2-lite-v1:free",
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
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  if (!req.session) {
    req.session = {};
  }

  await new Promise((resolve, reject) => {
    parseJson(req, res, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  if (req.method === 'POST') {


    console.log('Received inquiry request:', req.url);
    if (req.url === '/backend/inquire') {
      return inquire(req, res);
    }
    else if (req.url === '/backend/admin/login') {
      return adminLogin(req, res);
    }
    // else if (req.url === '/backend/admin/logout')
    //   return adminLogout(req, res);
  }
  else if (req.method === 'GET') {
    if (req.url === '/backend/admin/status')
      return checkAuthStatus(req, res);
    else if (req.url === '/backend/admin/inquiries')
      return fetchInquiries(req, res);
  }
  else {
    return res.status(404).json({ message: 'Not Found' });
  }
};


async function inquire(req, res) {
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
}

async function adminLogin(req, res) {
  passport.authenticate('local', (err, user, info) => {
    if (err) return res.status(500).json({ message: 'Login error' });
    if (!user) return res.status(401).json({ message: info.message });
    
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('User logged in:', user.username);
    return res.status(200).json({ 
      message: 'Login successful',
      token 
    });
  })(req, res);
}

// async function adminLogout(req, res) {
//   req.session.user = null;
//   return res.status(200).json({ message: 'Logged out successfully' });
// }

async function checkAuthStatus(req, res) {
  if (req.session.user) {
    return res.status(200).json({ authenticated: true, user: req.session.user });
  }
  return res.status(200).json({ authenticated: false });
}

async function fetchInquiries(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized - no token provided' });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized - invalid token' });
  }

  try {
    const db = await connectToDatabase();
    const inquiries = await db.collection('clients.client_data').find({}).toArray();
    
    return res.status(200).json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return res.status(500).json({
      message: 'Error fetching inquiries',
      error: error.message
    });
  }
}