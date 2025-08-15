import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  code: { type: String, index: true },
  name: String,
  phone: String,
  address: String,
  city: String,
  serviceType: String,
  bedrooms: String,
  bathrooms: String,
  date: String,
  time: String,
  notes: String,
  status: { type: String, default: 'new', enum: ['new','confirmed','in-progress','completed','cancelled'] },
  assignedTo: String,
  priceQuoted: String,
  paymentStatus: { type: String, default: 'unpaid', enum: ['unpaid','advance','paid','refunded'] },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
}, { minimize: false });

export default mongoose.model('Booking', BookingSchema);
