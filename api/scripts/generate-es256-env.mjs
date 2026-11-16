import {
  generateKeyPairSync,
  randomBytes,
} from 'node:crypto';

import {
  existsSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';

import {
  resolve,
} from 'node:path';

const projectRoot =
  process.cwd();

const envPath =
  resolve(
    projectRoot,
    '.env',
  );

const {
  privateKey,
  publicKey,
} =
  generateKeyPairSync(
    'ec',
    {
      namedCurve:
        'prime256v1',
    },
  );

const privateKeyPem =
  privateKey.export({
    type:
      'pkcs8',

    format:
      'pem',
  });

const publicKeyPem =
  publicKey.export({
    type:
      'spki',

    format:
      'pem',
  });

const kid =
  'local-dev';

const privateKeyBase64 =
  Buffer
    .from(
      privateKeyPem,
    )
    .toString(
      'base64',
    );

const publicKeyBase64 =
  Buffer
    .from(
      publicKeyPem,
    )
    .toString(
      'base64',
    );

const publicKeysJson =
  JSON.stringify({
    publicKeyBase64,
  });

const refreshTokenPepper =
  randomBytes(
    32,
  ).toString(
    'base64',
  );

const legacyAccessSecret =
  randomBytes(
    48,
  ).toString(
    'base64url',
  );

const legacyRefreshSecret =
  randomBytes(
    48,
  ).toString(
    'base64url',
  );

const replacements = {
  AUTH_JWT_ACTIVE_KID:
    kid,

  AUTH_JWT_PRIVATE_KEY_BASE64:
    privateKeyBase64,

  AUTH_JWT_PUBLIC_KEYS_JSON:
    publicKeysJson,

  AUTH_ACCESS_TOKEN_TTL_SECONDS:
    '600',

  AUTH_REFRESH_TOKEN_PEPPER:
    refreshTokenPepper,

  AUTH_ACCESS_TOKEN_SECRET:
    legacyAccessSecret,

  AUTH_REFRESH_TOKEN_SECRET:
    legacyRefreshSecret,
};

const existingContent =
  existsSync(
    envPath,
  )
    ? readFileSync(
        envPath,
        'utf8',
      )
    : '';

const existingLines =
  existingContent
    .split(
      /\r?\n/,
    )
    .filter(
      (
        line,
      ) =>
        line.length >
        0,
    );

const processedNames =
  new Set();

const updatedLines =
  existingLines.map(
    (
      line,
    ) => {
      const separatorIndex =
        line.indexOf(
          '=',
        );

      if (
        separatorIndex <
        1
      ) {
        return line;
      }

      const name =
        line
          .slice(
            0,
            separatorIndex,
          )
          .trim();

      if (
        !Object.hasOwn(
          replacements,
          name,
        )
      ) {
        return line;
      }

      processedNames.add(
        name,
      );

      return `${name}=${replacements[name]}`;
    },
  );

for (
  const [
    name,
    value,
  ] of Object.entries(
    replacements,
  )
) {
  if (
    !processedNames.has(
      name,
    )
  ) {
    updatedLines.push(
      `${name}=${value}`,
    );
  }
}

writeFileSync(
  envPath,
  `${updatedLines.join('\n')}\n`,
  'utf8',
);

console.log(
  '.env mis à jour avec une nouvelle paire ES256.',
);

console.log(
  'Les valeurs sensibles ne sont pas affichées.',
);