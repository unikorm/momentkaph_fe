import { apiUrl } from '../config/env.js';

/** `data` is `{ name, email, phone, message }`. */
export async function sendEmail(data) {
  const res = await fetch(`${apiUrl}/email_sending`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return { status: res.status };
}
