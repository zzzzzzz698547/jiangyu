export type LeadFormValues = {
  name: string;
  phone: string;
  lineId: string;
  amount: string;
  occupation: string;
  notes: string;
};

export type LeadSubmissionResult = {
  ok: boolean;
  mocked: boolean;
  message: string;
  status?: number;
};

type LeadFieldMap = {
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

type LeadApiResponse = {
  ok?: boolean;
  success?: boolean;
  message?: string;
  error?: string;
  data?: unknown;
};

function getFieldMap(): LeadFieldMap {
  return {
    name: (import.meta.env.VITE_LEAD_FIELD_NAME as string | undefined) ?? 'name',
    phone: (import.meta.env.VITE_LEAD_FIELD_PHONE as string | undefined) ?? 'phone',
    lineId: (import.meta.env.VITE_LEAD_FIELD_LINE_ID as string | undefined) ?? 'lineId',
    amount: (import.meta.env.VITE_LEAD_FIELD_AMOUNT as string | undefined) ?? 'amount',
    occupation:
      (import.meta.env.VITE_LEAD_FIELD_OCCUPATION as string | undefined) ?? 'occupation',
    notes: (import.meta.env.VITE_LEAD_FIELD_NOTES as string | undefined) ?? 'notes',
    source: (import.meta.env.VITE_LEAD_FIELD_SOURCE as string | undefined) ?? 'source',
    submittedAt:
      (import.meta.env.VITE_LEAD_FIELD_SUBMITTED_AT as string | undefined) ?? 'submittedAt',
    pageUrl: (import.meta.env.VITE_LEAD_FIELD_PAGE_URL as string | undefined) ?? 'pageUrl',
  };
}

function buildPayload(values: LeadFormValues): Record<string, string> {
  const fieldMap = getFieldMap();

  return {
    [fieldMap.name]: values.name,
    [fieldMap.phone]: values.phone,
    [fieldMap.lineId]: values.lineId,
    [fieldMap.amount]: values.amount,
    [fieldMap.occupation]: values.occupation,
    [fieldMap.notes]: values.notes,
    [fieldMap.source]: 'jiangyu-landing-page',
    [fieldMap.submittedAt]: new Date().toISOString(),
    [fieldMap.pageUrl]: window.location.href,
  };
}

function parseHeaders(raw: string | undefined): Record<string, string> {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return Object.entries(parsed).reduce<Record<string, string>>((acc, [key, value]) => {
      if (typeof value === 'string' && value.trim()) {
        acc[key] = value;
      }
      return acc;
    }, {});
  } catch {
    return {};
  }
}

function extractResponseMessage(payload: LeadApiResponse | undefined, fallback: string): string {
  if (!payload) {
    return fallback;
  }

  if (typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message;
  }

  if (typeof payload.error === 'string' && payload.error.trim()) {
    return payload.error;
  }

  return fallback;
}

function getSuccessMessage(payload: LeadApiResponse | undefined, mocked: boolean) {
  if (mocked) {
    return '已收到你的資料，這是模擬送出，後續可直接串接正式 API。';
  }

  return extractResponseMessage(payload, '資料已成功送出，專人會盡快與你聯繫。');
}

async function readResponseBody(response: Response): Promise<LeadApiResponse | undefined> {
  const contentType = response.headers.get('content-type') ?? '';
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text) as LeadApiResponse;
    } catch {
      return undefined;
    }
  }

  return { message: text };
}

export async function submitLead(values: LeadFormValues): Promise<LeadSubmissionResult> {
  const endpoint = (import.meta.env.VITE_LEAD_API_URL as string | undefined) ?? '/api/leads';
  const method = ((import.meta.env.VITE_LEAD_API_METHOD as string | undefined) ?? 'POST').toUpperCase();
  const format = ((import.meta.env.VITE_LEAD_API_FORMAT as string | undefined) ?? 'json').toLowerCase();
  const token = import.meta.env.VITE_LEAD_API_TOKEN as string | undefined;
  const extraHeaders = parseHeaders(import.meta.env.VITE_LEAD_API_HEADERS_JSON as string | undefined);
  const timeoutMs = Number(import.meta.env.VITE_LEAD_API_TIMEOUT_MS ?? 10000);
  const payload = buildPayload(values);

  if (endpoint === 'mock') {
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    return {
      ok: true,
      mocked: true,
      message: '已以模擬模式送出，等待正式 API 串接。',
    };
  }

  const headers: Record<string, string> = {
    ...extraHeaders,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let body: BodyInit | undefined;

  if (method !== 'GET') {
    if (format === 'form') {
      const formData = new URLSearchParams();
      Object.entries(payload).forEach(([key, value]) => {
        formData.set(key, value);
      });
      body = formData;
      headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
    } else {
      body = JSON.stringify(payload);
      headers['Content-Type'] = 'application/json';
    }
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 10000);

  try {
    const response = await fetch(endpoint, {
      method,
      headers,
      body,
      signal: controller.signal,
      credentials: 'same-origin',
    });

    const responseBody = await readResponseBody(response);

    if (!response.ok) {
      throw new Error(extractResponseMessage(responseBody, `API 回應失敗：${response.status}`));
    }

    const apiMessage = getSuccessMessage(responseBody, false);

    return {
      ok: true,
      mocked: false,
      message: apiMessage,
      status: response.status,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('送出逾時，請稍後再試');
    }

    throw error instanceof Error ? error : new Error('送出失敗');
  } finally {
    window.clearTimeout(timeout);
  }
}
