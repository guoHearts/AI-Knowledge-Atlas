const DEFAULT_BACKEND_URL = 'http://localhost:8000';

function trimTrailingSlash(value: string): string {
  return value.replace(/\/$/, '');
}

export function getBackendInternalUrl(): string {
  return trimTrailingSlash(
    process.env.BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      DEFAULT_BACKEND_URL,
  );
}

export function getPublicApiUrl(): string {
  return trimTrailingSlash(process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND_URL);
}
