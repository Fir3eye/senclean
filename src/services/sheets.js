import { google } from 'googleapis';

function getAuth(){
  // Option 1: JSON file path
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON_PATH){
    return new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_JSON_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
  }
  // Option 2: Inline base64 JSON
  if (process.env.GOOGLE_SERVICE_ACCOUNT_B64){
    const creds = JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_B64, 'base64').toString('utf-8'));
    return new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
  }
  return null;
}

export async function appendBookingToSheet(booking){
  if (String(process.env.GOOGLE_SHEETS_ENABLED).toLowerCase() !== 'true') return;
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) return;
  const auth = getAuth();
  if (!auth) return;
  const sheets = google.sheets({ version: 'v4', auth });
  const values = [[
    booking.code,
    booking.name,
    booking.phone,
    booking.city || '',
    booking.serviceType || '',
    booking.bedrooms || '',
    booking.bathrooms || '',
    booking.date || '',
    booking.time || '',
    booking.status || '',
    booking.priceQuoted || '',
    booking.paymentStatus || '',
    new Date(booking.createdAt || Date.now()).toISOString()
  ]];
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Bookings!A1',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values }
  });
}
