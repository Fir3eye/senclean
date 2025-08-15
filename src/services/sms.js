import twilio from 'twilio';

export async function sendSMS(to, body){
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  if (!sid || !token || !from) return;
  const client = twilio(sid, token);
  return client.messages.create({ body, to, from });
}
