import { randomUUID } from 'node:crypto';

export const REQUEST_ID_HEADER = 'x-request-id';

export const createRequestId = (): string => {
  return randomUUID();
};

export const resolveRequestId = (
  requestId?: string | string[],
): string => {
  if (Array.isArray(requestId)) {
    return requestId[0]?.trim() || createRequestId();
  }

  return requestId?.trim() || createRequestId();
};