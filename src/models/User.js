import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, index: true },
  passwordHash: String,
  role: { type: String, default: 'admin', enum: ['admin','dispatcher','worker'] },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.methods.setPassword = async function(pw){
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(pw, salt);
}

UserSchema.methods.validatePassword = async function(pw){
  return bcrypt.compare(pw, this.passwordHash);
}

export default mongoose.model('User', UserSchema);
