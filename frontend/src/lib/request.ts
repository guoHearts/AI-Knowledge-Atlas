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

const DEFAULT_TIMEOUT_MS = 15_000;

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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  // Let caller override the signal; our timeout is the fallback.
  const signal = options.signal ?? controller.signal;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal,
    });
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError({
        code: 'REQUEST_TIMEOUT',
        message: `Request timed out after ${DEFAULT_TIMEOUT_MS}ms`,
        status: 0,
      });
    }
    throw new ApiError({
      code: 'NETWORK_ERROR',
      message: err instanceof Error ? err.message : 'Network request failed',
      status: 0,
    });
  } finally {
    clearTimeout(timeoutId);
  }

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
