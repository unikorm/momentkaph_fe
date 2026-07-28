import { apiUrl } from '../config/env.js';
import type { SendEmailType } from '../shared/types/send-email.type.js';

export async function sendEmail(data: SendEmailType): Promise<{ status: number }> {
  const res = await fetch(`${apiUrl}/email_sending`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return { status: res.status };
}
