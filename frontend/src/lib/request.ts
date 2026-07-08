type ApiErrorBody = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

type ApiEnvelope<T> =
  | {
      success: true;
      data: T;
      message?: string;
      requestId?: string;
    }
  | {
      success: false;
      error: ApiErrorBody;
      requestId?: string;
    };

export class ApiError extends Error {
  code: string;
  status: number;
  details: Record<string, unknown>;
  requestId?: string;

  constructor(params: {
    code: string;
    message: string;
    status: number;
    details?: Record<string, unknown>;
    requestId?: string;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.code = params.code;
    this.status = params.status;
    this.details = params.details || {};
    this.requestId = params.requestId;
  }
}

function isApiEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    typeof (value as { success: unknown }).success === 'boolean'
  );
}

async function parseJson(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;

  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function request<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const body = await parseJson(response);

  if (isApiEnvelope<T>(body)) {
    if (body.success) return body.data;

    throw new ApiError({
      code: body.error.code,
      message: body.error.message,
      status: response.status,
      details: body.error.details,
      requestId: body.requestId,
    });
  }

  if (!response.ok) {
    throw new ApiError({
      code: 'REQUEST_FAILED',
      message:
        typeof body === 'string'
          ? body
          : `Request failed with status ${response.status}`,
      status: response.status,
    });
  }

  return body as T;
}
