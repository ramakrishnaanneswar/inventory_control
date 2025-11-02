const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/inventory_demo';

// Simple connect
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=>console.log('MongoDB connected'))
  .catch(err=>console.error('MongoDB connection error:', err));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Models
const User = require('./models/User');
const Item = require('./models/Item');

// --- Auth routes ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if(!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const existing = await User.findOne({ email: email.toLowerCase() });
    if(existing) return res.status(400).json({ error: 'Email already exists' });
    const user = new User({ name, email: email.toLowerCase(), password });
    await user.save();
    res.json({ user: { id: user._id, name: user.name, email: user.email }, token: String(user._id) });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email||'').toLowerCase(), password });
    if(!user) return res.status(400).json({ error: 'Invalid credentials' });
    res.json({ user: { id: user._id, name: user.name, email: user.email }, token: String(user._id) });
  } catch(err){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// simple middleware to extract user from token (Authorization: Bearer <token>)
async function authMiddleware(req, res, next){
  const header = req.headers['authorization'] || '';
  const m = header.match(/^Bearer\s+(.+)$/i);
  if(!m) return res.status(401).json({ error: 'Missing auth' });
  const token = m[1];
  try {
    const user = await User.findById(token);
    if(!user) return res.status(401).json({ error: 'Invalid token' });
    req.user = user;
    next();
  } catch(err){
    console.error(err);
    res.status(401).json({ error: 'Invalid token' });
  }
}

// --- Items routes ---
app.get('/api/items', authMiddleware, async (req, res) => {
  const items = await Item.find({ owner: req.user._id }).sort({ created: -1 });
  res.json(items);
});

app.post('/api/items', authMiddleware, async (req, res) => {
  const { name, sku, qty, price } = req.body;
  if(!name) return res.status(400).json({ error: 'Name required' });
  const it = new Item({
    owner: req.user._id,
    name,
    sku: sku || '',
    qty: Number(qty||0),
    price: Number(price||0),
    created: Date.now()
  });
  await it.save();
  res.json(it);
});

app.put('/api/items/:id', authMiddleware, async (req, res) => {
  const id = req.params.id;
  const update = { name: req.body.name, sku: req.body.sku||'', qty: Number(req.body.qty||0), price: Number(req.body.price||0) };
  const it = await Item.findOneAndUpdate({ _id: id, owner: req.user._id }, update, { new: true });
  if(!it) return res.status(404).json({ error: 'Item not found' });
  res.json(it);
});

app.delete('/api/items/:id', authMiddleware, async (req, res) => {
  const id = req.params.id;
  const it = await Item.findOneAndDelete({ _id: id, owner: req.user._id });
  if(!it) return res.status(404).json({ error: 'Item not found' });
  res.json({ success: true });
});

// Serve frontend (already in public)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, ()=>console.log('Server listening on port', PORT));
