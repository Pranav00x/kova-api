import { redis } from "./redis.js";

const OTP_TTL_SECONDS = 5 * 60;
const MAX_ATTEMPTS = 5;

function otpKey(identifier: string): string {
  return `otp:${identifier}`;
}

function attemptsKey(identifier: string): string {
  return `otp:attempts:${identifier}`;
}

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function requestOtp(identifier: string): Promise<void> {
  const code = generateOtp();
  await redis.set(otpKey(identifier), code, "EX", OTP_TTL_SECONDS);
  await redis.del(attemptsKey(identifier));
  await sendOtp(identifier, code);
}

export async function verifyOtp(identifier: string, code: string): Promise<boolean> {
  const attempts = await redis.incr(attemptsKey(identifier));
  await redis.expire(attemptsKey(identifier), OTP_TTL_SECONDS);
  if (attempts > MAX_ATTEMPTS) {
    return false;
  }

  const stored = await redis.get(otpKey(identifier));
  if (!stored || stored !== code) {
    return false;
  }

  await redis.del(otpKey(identifier));
  return true;
}

async function sendOtp(identifier: string, code: string): Promise<void> {
  const isPhone = /^\+?[0-9]+$/.test(identifier);

  if (isPhone && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM_NUMBER;
    await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: identifier,
        From: from ?? "",
        Body: `Your Kova verification code is ${code}`,
      }),
    });
    return;
  }

  if (!isPhone && process.env.SENDGRID_API_KEY) {
    await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: identifier }] }],
        from: { email: "hi@kova.money" },
        subject: "Your Kova verification code",
        content: [{ type: "text/plain", value: `Your Kova verification code is ${code}` }],
      }),
    });
    return;
  }

  // Dev fallback — no SMS/email provider configured
  console.log(`[otp] ${identifier} -> ${code}`);
}
