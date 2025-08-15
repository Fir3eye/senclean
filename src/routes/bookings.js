import { Router } from 'express';
import { nanoid } from 'nanoid';
import Booking from '../models/Booking.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { appendBookingToSheet } from '../services/sheets.js';
import { sendMail } from '../services/mailer.js';
import { sendSMS } from '../services/sms.js';

const router = Router();

// Public: create booking
router.post('/bookings', async (req, res) => {
  const b = new Booking({ ...req.body, code: nanoid(8) });
  await b.save();
  // Async best-effort side-effects (no await necessary, but safe here)
  await appendBookingToSheet(b);
  // Notify admin (email)
  await sendMail({
    to: process.env.SMTP_USER,
    subject: `New Booking ${b.code} — ${b.serviceType}`,
    text: `New booking from ${b.name} (${b.phone}). Service: ${b.serviceType}. Address: ${b.address}`
  });
  // Optional SMS to admin
  if (process.env.TWILIO_ACCOUNT_SID) {
    await sendSMS(process.env.ADMIN_SMS_TO || '', `New Senclean booking ${b.code} from ${b.name} (${b.phone})`);
  }
  res.json({ ok: true, booking: b });
});

// Admin: list
router.get('/bookings', requireAuth, requireRole('admin','dispatcher'), async (req, res) => {
  const items = await Booking.find({}).sort({ createdAt: -1 }).limit(500);
  res.json({ ok: true, bookings: items });
});

// Admin: update
router.patch('/bookings/:id', requireAuth, requireRole('admin','dispatcher'), async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body, updatedAt: new Date() };
  const item = await Booking.findByIdAndUpdate(id, updates, { new: true });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true, booking: item });
});

export default router;
