const REDACTED_VALUE = '[REDACTED]';

const SENSITIVE_KEYS = new Set<string>([
  'authorization',
  'cookie',
  'setcookie',
  'password',
  'passwordhash',
  'passwordconfirmation',
  'accesstoken',
  'refreshtoken',
  'token',
  'tokenhash',
  'csrftoken',
  'csrftokenhash',
  'secret',
  'clientsecret',
  'apikey',
  'privatekey',
  'databasepassword',
]);

const normalizeKey = (key: string): string => {
  return key
    .toLowerCase()
    .replace(/[_\-\s]/g, '');
};

const isSensitiveKey = (key: string): boolean => {
  return SENSITIVE_KEYS.has(normalizeKey(key));
};

export const redactSensitiveData = (
  value: unknown,
): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) =>
      redactSensitiveData(item),
    );
  }

  if (
    value !== null &&
    typeof value === 'object'
  ) {
    return Object.fromEntries(
      Object.entries(
        value as Record<string, unknown>,
      ).map(([key, nestedValue]) => [
        key,
        isSensitiveKey(key)
          ? REDACTED_VALUE
          : redactSensitiveData(nestedValue),
      ]),
    );
  }

  return value;
};