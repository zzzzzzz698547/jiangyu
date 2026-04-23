import nodemailer from 'nodemailer';
import type { IncomingMessage, ServerResponse } from 'node:http';

export type LeadFieldMap = {
  name: string;
  phone: string;
  lineId: string;
  amount: string;
  occupation: string;
  notes: string;
  source: string;
  submittedAt: string;
  pageUrl: string;
};

export type LeadRequestBody = Record<string, unknown>;

export type LeadContact = {
  name: string;
  phone: string;
  lineId: string;
  amount: string;
  occupation: string;
  notes: string;
  source: string;
  submittedAt: string;
  pageUrl: string;
};

type HandleLeadOptions = {
  allowMock?: boolean;
};

function getEnv(env: Record<string, string | undefined>, key: string, fallback = '') {
  const value = env[key];
  return typeof value === 'string' ? value.trim() : fallback;
}

export function getLeadFieldMap(env: Record<string, string | undefined>): LeadFieldMap {
  return {
    name: getEnv(env, 'VITE_LEAD_FIELD_NAME', 'name'),
    phone: getEnv(env, 'VITE_LEAD_FIELD_PHONE', 'phone'),
    lineId: getEnv(env, 'VITE_LEAD_FIELD_LINE_ID', 'lineId'),
    amount: getEnv(env, 'VITE_LEAD_FIELD_AMOUNT', 'amount'),
    occupation: getEnv(env, 'VITE_LEAD_FIELD_OCCUPATION', 'occupation'),
    notes: getEnv(env, 'VITE_LEAD_FIELD_NOTES', 'notes'),
    source: getEnv(env, 'VITE_LEAD_FIELD_SOURCE', 'source'),
    submittedAt: getEnv(env, 'VITE_LEAD_FIELD_SUBMITTED_AT', 'submittedAt'),
    pageUrl: getEnv(env, 'VITE_LEAD_FIELD_PAGE_URL', 'pageUrl'),
  };
}

export function parseLeadBody(rawBody: string, contentType: string): LeadRequestBody {
  if (!rawBody.trim()) {
    return {};
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(rawBody);
    return Object.fromEntries(params.entries());
  }

  return JSON.parse(rawBody) as LeadRequestBody;
}

function readValue(body: LeadRequestBody, key: string) {
  const value = body[key];
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeLeadContact(body: LeadRequestBody, fieldMap: LeadFieldMap): LeadContact {
  return {
    name: readValue(body, fieldMap.name) || readValue(body, 'name'),
    phone: readValue(body, fieldMap.phone) || readValue(body, 'phone'),
    lineId: readValue(body, fieldMap.lineId) || readValue(body, 'lineId'),
    amount: readValue(body, fieldMap.amount) || readValue(body, 'amount'),
    occupation: readValue(body, fieldMap.occupation) || readValue(body, 'occupation'),
    notes: readValue(body, fieldMap.notes) || readValue(body, 'notes'),
    source: readValue(body, fieldMap.source) || readValue(body, 'source') || 'jiangyu-landing-page',
    submittedAt:
      readValue(body, fieldMap.submittedAt) || readValue(body, 'submittedAt') || new Date().toISOString(),
    pageUrl: readValue(body, fieldMap.pageUrl) || readValue(body, 'pageUrl') || '',
  };
}

export function validateLeadContact(contact: LeadContact) {
  const errors: string[] = [];

  if (!contact.name) errors.push('姓名');
  if (!contact.phone) errors.push('手機號碼');
  if (!contact.amount) errors.push('需求金額');

  return errors;
}

function buildHtml(contact: LeadContact) {
  const rows = [
    ['姓名', contact.name],
    ['電話', contact.phone],
    ['LINE ID', contact.lineId || '未填'],
    ['資金需求', contact.amount],
    ['職業類型', contact.occupation || '未填'],
    ['備註', contact.notes || '未填'],
    ['來源', contact.source],
    ['送出時間', contact.submittedAt],
    ['頁面網址', contact.pageUrl || '未填'],
  ]
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:700;color:#0f172a;">${label}</td>
          <td style="padding:10px 12px;border:1px solid #e2e8f0;color:#334155;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join('');

  return `
    <div style="font-family:Arial,'Noto Sans TC',sans-serif;background:#f4f7fc;padding:24px;">
      <div style="max-width:720px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;">
        <div style="padding:24px;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:#fff;">
          <div style="font-size:14px;letter-spacing:.2em;text-transform:uppercase;opacity:.8;">New Lead</div>
          <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;">網站表單已送出</h1>
          <p style="margin:10px 0 0;font-size:14px;line-height:1.8;opacity:.9;">這是一筆從貸款落地頁送出的新名單，請盡快聯繫。</p>
        </div>
        <div style="padding:24px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}</table>
        </div>
      </div>
    </div>`;
}

function buildText(contact: LeadContact) {
  return [
    '網站表單已送出',
    `姓名：${contact.name}`,
    `電話：${contact.phone}`,
    `LINE ID：${contact.lineId || '未填'}`,
    `資金需求：${contact.amount}`,
    `職業類型：${contact.occupation || '未填'}`,
    `備註：${contact.notes || '未填'}`,
    `來源：${contact.source}`,
    `送出時間：${contact.submittedAt}`,
    `頁面網址：${contact.pageUrl || '未填'}`,
  ].join('\n');
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function getMailConfig(env: Record<string, string | undefined>) {
  const gmailUser = getEnv(env, 'LEAD_GMAIL_USER');
  const gmailAppPassword = getEnv(env, 'LEAD_GMAIL_APP_PASSWORD');
  const toEmail = getEnv(env, 'LEAD_TO_EMAIL', gmailUser);
  const fromName = getEnv(env, 'LEAD_FROM_NAME', '將御線上理財平臺');

  return { gmailUser, gmailAppPassword, toEmail, fromName };
}

async function dispatchLeadMail(contact: LeadContact, env: Record<string, string | undefined>) {
  const { gmailUser, gmailAppPassword, toEmail, fromName } = getMailConfig(env);

  if (!gmailUser || !gmailAppPassword || !toEmail) {
    throw new Error('請先設定 LEAD_GMAIL_USER、LEAD_GMAIL_APP_PASSWORD、LEAD_TO_EMAIL');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });

  const subject = `【網站表單】${contact.name}｜${contact.amount}`;

  await transporter.sendMail({
    from: `"${fromName}" <${gmailUser}>`,
    to: toEmail,
    replyTo: contact.lineId ? gmailUser : gmailUser,
    subject,
    text: buildText(contact),
    html: buildHtml(contact),
  });
}

export async function handleLeadRequest(
  req: IncomingMessage,
  res: ServerResponse,
  env: Record<string, string | undefined>,
  options: HandleLeadOptions = {},
) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, message: 'Method Not Allowed' });
    return;
  }

  let rawBody = '';
  for await (const chunk of req) {
    rawBody += String(chunk);
  }

  let parsedBody: LeadRequestBody = {};
  try {
    const contentType = String(req.headers['content-type'] ?? '');
    parsedBody = parseLeadBody(rawBody, contentType);
  } catch {
    sendJson(res, 400, { ok: false, message: '無法解析表單資料' });
    return;
  }

  const fieldMap = getLeadFieldMap(env);
  const contact = normalizeLeadContact(parsedBody, fieldMap);
  const missing = validateLeadContact(contact);

  if (missing.length > 0) {
    sendJson(res, 422, {
      ok: false,
      message: `${missing.join('、')}為必填`,
    });
    return;
  }

  const mailConfig = getMailConfig(env);
  const hasMailConfig = Boolean(mailConfig.gmailUser && mailConfig.gmailAppPassword && mailConfig.toEmail);

  if (!hasMailConfig) {
    if (options.allowMock) {
      sendJson(res, 200, {
        ok: true,
        mocked: true,
        message: '已收到表單資料，目前為本機模擬模式，尚未設定 Gmail。',
        data: contact,
      });
      return;
    }

    sendJson(res, 503, {
      ok: false,
      message: '尚未設定 Gmail 寄信參數，請補上 LEAD_GMAIL_USER、LEAD_GMAIL_APP_PASSWORD、LEAD_TO_EMAIL',
    });
    return;
  }

  try {
    await dispatchLeadMail(contact, env);
    sendJson(res, 200, {
      ok: true,
      mocked: false,
      message: '已成功寄送到 Gmail',
      data: contact,
    });
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      message: error instanceof Error ? error.message : '寄信失敗',
    });
  }
}
