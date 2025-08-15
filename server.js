import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json({ verify: (req, res, buf) => { req.rawBody = buf } }));
app.use(express.urlencoded({ extended: true }));

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
app.use(cors({ origin: ALLOWED_ORIGIN === '*' ? true : ALLOWED_ORIGIN }));

// Static site (optional): place your frontend in ./public
app.use(express.static(path.join(__dirname, 'public')));

// Mongo connect
const MONGO = process.env.MONGODB_URI;
if (!MONGO) {
  console.warn('MONGODB_URI missing. Some features will not work until DB is connected.');
} else {
  mongoose.connect(MONGO).then(()=>console.log('MongoDB connected')).catch(e=>console.error('MongoDB error', e.message));
}

// Routes
import authRoutes from './src/routes/auth.js';
import bookingRoutes from './src/routes/bookings.js';
import paymentRoutes from './src/routes/payments.js';

app.use('/api/auth', authRoutes);
app.use('/api', bookingRoutes);
app.use('/api', paymentRoutes);

app.get('/api/health', (req,res)=>res.json({ ok:true, time:new Date().toISOString() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>console.log('Senclean backend on http://localhost:'+PORT));
