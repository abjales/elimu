/**
 * M-Pesa Daraja (Safaricom) integration — server-side only.
 *
 * Credentials are read from environment variables ONLY and must never be
 * exposed to the client. The frontend talks exclusively to the Elimu backend.
 *
 * Required env vars:
 *   MPESA_ENVIRONMENT              'sandbox' | 'production'
 *   MPESA_CONSUMER_KEY             Daraja app consumer key
 *   MPESA_CONSUMER_SECRET          Daraja app consumer secret
 *   MPESA_PASSKEY                  Lipa Na M-Pesa Online passkey
 *   MPESA_SHORTCODE                Business shortcode (Till/Paybill number)
 *   MPESA_SHORTCODE_TYPE           'till' | 'paybill'
 *   MPESA_CALLBACK_URL             Public HTTPS callback URL (must be reachable by Safaricom)
 *   MPESA_PRO_MONTHLY_AMOUNT_KSHS  Pro monthly price in KES (integer)
 *   MPESA_PRO_ANNUAL_AMOUNT_KSHS   Pro annual price in KES (integer)
 */

const BASE_URLS: Record<'sandbox' | 'production', string> = {
  sandbox: 'https://sandbox.safaricom.co.ke',
  production: 'https://api.safaricom.co.ke',
};

type Environment = 'sandbox' | 'production';
type Plan = 'monthly' | 'annual';

export interface MpesaConfig {
  environment: Environment;
  consumerKey: string;
  consumerSecret: string;
  passkey: string;
  shortcode: string;
  shortcodeType: 'till' | 'paybill';
  callbackUrl: string;
}

function getConfig(): MpesaConfig {
  const environment = (process.env.MPESA_ENVIRONMENT || 'sandbox') as Environment;
  return {
    environment,
    consumerKey: process.env.MPESA_CONSUMER_KEY || '',
    consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
    passkey: process.env.MPESA_PASSKEY || '',
    shortcode: process.env.MPESA_SHORTCODE || '',
    shortcodeType: (process.env.MPESA_SHORTCODE_TYPE || 'paybill') as 'till' | 'paybill',
    callbackUrl: process.env.MPESA_CALLBACK_URL || '',
  };
}

export function isMpesaConfigured(): boolean {
  const c = getConfig();
  return Boolean(
    c.consumerKey && c.consumerSecret && c.passkey && c.shortcode && c.callbackUrl
  );
}

function baseUrl(): string {
  return BASE_URLS[getConfig().environment];
}

/** Basic-auth token for the OAuth endpoint: base64(consumerKey:consumerSecret). */
function basicAuth(): string {
  const { consumerKey, consumerSecret } = getConfig();
  return Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
}

/** Fetch a short-lived OAuth access token from Daraja. */
export async function getAccessToken(): Promise<string> {
  const url = `${baseUrl()}/oauth/v1/generate?grant_type=client_credentials`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${basicAuth()}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Daraja OAuth failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error('Daraja OAuth response missing access_token');
  }
  return data.access_token;
}

/**
 * Normalize a Kenyan phone number to international 254 format.
 * Accepts: 07XXXXXXXX, 7XXXXXXXX, 2547XXXXXXXX, +2547XXXXXXXX, 011XXXXXXXX.
 */
export function normalizePhone(input: string): string {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('254')) {
    digits = digits.slice(3);
  } else if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  // Leading '1' for new 01XX numbers is preserved by prepending 254.
  return `254${digits}`;
}

/** Validate that a normalized phone looks like a Kenyan mobile number. */
export function isValidKenyanPhone(normalized: string): boolean {
  // 254 + a mobile prefix (7XX legacy or 1XX new ranges) + 8 digits.
  return /^254[17]\d{8}$/.test(normalized);
}

/** Daraja timestamp format: YYYYMMDDHHmmss in East Africa Time (UTC+3). */
function darajaTimestamp(): string {
  const now = new Date(Date.now() + 3 * 60 * 60 * 1000); // EAT
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    now.getUTCFullYear().toString() +
    pad(now.getUTCMonth() + 1) +
    pad(now.getUTCDate()) +
    pad(now.getUTCHours()) +
    pad(now.getUTCMinutes()) +
    pad(now.getUTCSeconds())
  );
}

/** STK push password = base64(shortcode + passkey + timestamp). */
function stkPassword(timestamp: string): string {
  const { shortcode, passkey } = getConfig();
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
}

export function proAmountForPlan(plan: Plan): number {
  const raw =
    plan === 'annual'
      ? process.env.MPESA_PRO_ANNUAL_AMOUNT_KSHS
      : process.env.MPESA_PRO_MONTHLY_AMOUNT_KSHS;
  const amount = parseInt(raw || '0', 10);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(
      `M-Pesa price not configured for plan '${plan}'. Set MPESA_PRO_${plan.toUpperCase()}_AMOUNT_KSHS.`
    );
  }
  return amount;
}

export interface StkPushResult {
  merchantRequestId: string;
  checkoutRequestId: string;
  responseCode: string;
  responseDescription: string;
  customerMessage: string;
}

/**
 * Initiate a Lipa Na M-Pesa Online STK Push.
 * Returns the checkout request id that the callback will reference.
 */
export async function stkPush(params: {
  phone: string; // normalized 254…
  amount: number;
  accountReference: string;
  transactionDesc: string;
}): Promise<StkPushResult> {
  const { shortcode, shortcodeType } = getConfig();
  const token = await getAccessToken();
  const timestamp = darajaTimestamp();

  const body = {
    BusinessShortCode: shortcode,
    Password: stkPassword(timestamp),
    Timestamp: timestamp,
    TransactionType:
      shortcodeType === 'till' ? 'CustomerBuyGoodsOnline' : 'CustomerPayBillOnline',
    Amount: String(params.amount),
    PartyA: params.phone,
    PartyB: shortcode,
    PhoneNumber: params.phone,
    CallBackURL: getConfig().callbackUrl,
    AccountReference: params.accountReference,
    TransactionDesc: params.transactionDesc,
  };

  const res = await fetch(`${baseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as Record<string, unknown>;

  if (!res.ok) {
    throw new Error(
      `Daraja STK Push failed (${res.status}): ${JSON.stringify(data)}`
    );
  }

  return {
    merchantRequestId: String(data.MerchantRequestID ?? ''),
    checkoutRequestId: String(data.CheckoutRequestID ?? ''),
    responseCode: String(data.ResponseCode ?? ''),
    responseDescription: String(data.ResponseDescription ?? ''),
    customerMessage: String(data.CustomerMessage ?? ''),
  };
}

export interface StkQueryResult {
  resultCode: string;
  resultDesc: string;
}

/**
 * Actively query the status of an STK Push transaction.
 * Useful to reconcile a payment if the callback never arrived.
 */
export async function queryStkStatus(checkoutRequestId: string): Promise<StkQueryResult> {
  const { shortcode, passkey } = getConfig();
  const token = await getAccessToken();
  const timestamp = darajaTimestamp();

  const body = {
    BusinessShortCode: shortcode,
    Password: Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64'),
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId,
  };

  const res = await fetch(`${baseUrl()}/mpesa/stkpushquery/v1/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(
      `Daraja STK Query failed (${res.status}): ${JSON.stringify(data)}`
    );
  }

  return {
    resultCode: String(data.ResultCode ?? ''),
    resultDesc: String(data.ResultDesc ?? ''),
  };
}

/** Parse the amount from an STK callback's CallbackMetadata items. */
export function extractCallbackAmount(callback: {
  CallbackMetadata?: { Item?: Array<{ Name?: string; Value?: unknown }> };
}): number | null {
  const item = callback.CallbackMetadata?.Item?.find((i) => i.Name === 'Amount');
  if (!item || item.Value == null) return null;
  const n = Number(item.Value);
  return Number.isFinite(n) ? n : null;
}

/** Extract the M-Pesa receipt number from an STK callback. */
export function extractReceiptNumber(callback: {
  CallbackMetadata?: { Item?: Array<{ Name?: string; Value?: unknown }> };
}): string | null {
  const item = callback.CallbackMetadata?.Item?.find((i) => i.Name === 'MpesaReceiptNumber');
  return item && item.Value != null ? String(item.Value) : null;
}
