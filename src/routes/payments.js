import { Router } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Booking from '../models/Booking.js';

const router = Router();

function getClient(){
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// Create order for a booking (amount in INR paise)
router.post('/payments/create-order', async (req, res) => {
  const { bookingId, amount, receipt } = req.body || {};
  const client = getClient();
  if (!client) return res.status(400).json({ error: 'Razorpay not configured' });
  if (!bookingId || !amount) return res.status(400).json({ error: 'bookingId and amount required' });
  const order = await client.orders.create({
    amount: Number(amount),
    currency: 'INR',
    receipt: receipt || `SENCLEAN_${bookingId}`,
    notes: { bookingId }
  });
  await Booking.findByIdAndUpdate(bookingId, { razorpayOrderId: order.id });
  res.json({ ok: true, order, key: process.env.RAZORPAY_KEY_ID });
});

// Webhook (set content-type: application/json, webhook secret in dashboard)
router.post('/payments/webhook', (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(req.rawBody);
  const digest = shasum.digest('hex');
  if (digest !== signature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  const event = req.body;
  if (event.event === 'payment.captured'){
    const payment = event.payload.payment.entity;
    const bookingId = payment.notes?.bookingId || null;
    if (bookingId){
      Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'paid', razorpayPaymentId: payment.id, updatedAt: new Date() }).exec();
    }
  }
  res.json({ ok: true });
});

export default router;
