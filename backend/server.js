import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { nanoid } from 'nanoid';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Simple CORS for dev if frontend served elsewhere
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-ADMIN-KEY');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const DATA_PATH = path.join(__dirname, 'bookings.json');
const PUBLIC_PATH = path.join(__dirname, 'public');

function readBookings() {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8') || '[]';
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeBookings(list) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(list, null, 2));
}

app.use(express.static(PUBLIC_PATH));

// Health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Create booking
app.post('/api/bookings', (req, res) => {
  const { name, phone, address, city, serviceType, bedrooms, bathrooms, date, time, notes } = req.body || {};
  if (!name || !phone || !address || !serviceType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const list = readBookings();
  const item = {
    id: nanoid(10),
    createdAt: new Date().toISOString(),
    status: 'new',
    name, phone, address, city: city || '', serviceType,
    bedrooms: bedrooms ?? '', bathrooms: bathrooms ?? '',
    date: date || '', time: time || '', notes: notes || '',
    assignedTo: '',
    priceQuoted: '',
  };
  list.push(item);
  writeBookings(list);
  res.json({ ok: true, booking: item });
});

// Admin auth middleware
function requireAdmin(req, res, next) {
  const key = req.header('X-ADMIN-KEY');
  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// List bookings (admin)
app.get('/api/bookings', requireAdmin, (req, res) => {
  res.json({ ok: true, bookings: readBookings() });
});

// Update booking (assign/status/price)
app.patch('/api/bookings/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};
  const list = readBookings();
  const idx = list.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
  writeBookings(list);
  res.json({ ok: true, booking: list[idx] });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
});
