import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

// Seed default admin if none
router.post('/seed-admin', async (req, res) => {
  const count = await User.countDocuments();
  if (count > 0) return res.json({ ok: true, message: 'Users already exist' });
  const u = new User({
    name: process.env.ADMIN_DEFAULT_NAME || 'Owner',
    email: process.env.ADMIN_DEFAULT_EMAIL || 'owner@senclean.local',
    role: 'admin'
  });
  await u.setPassword(process.env.ADMIN_DEFAULT_PASSWORD || 'ChangeMe123');
  await u.save();
  res.json({ ok: true, email: u.email });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const u = await User.findOne({ email });
  if (!u) return res.status(401).json({ error: 'Invalid creds' });
  const ok = await u.validatePassword(password || '');
  if (!ok) return res.status(401).json({ error: 'Invalid creds' });
  const token = jwt.sign({ id: u._id, role: u.role, name: u.name, email: u.email }, process.env.JWT_SECRET, { expiresIn: '2d' });
  res.json({ ok: true, token, user: { name: u.name, role: u.role, email: u.email } });
});

export default router;
