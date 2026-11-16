import {
  Injectable,
} from '@nestjs/common';

import {
  createHmac,
  randomBytes,
  randomUUID,
} from 'node:crypto';

import {
  JwtService,
} from '@nestjs/jwt';

import {
  EnvService,
} from '../../../common/config/index.js';

import {
  AuthSecurityException,
} from '../data/exception/auth-security.exception.js';

export type AccessTokenPayload = {
  sub: string;
  sid: string;
  jti: string;
  ver: number;
};

export type GeneratedTokenPair = {
  tokenId: string;

  accessToken: string;
  accessTokenExpiresInSeconds:
    number;

  refreshToken: string;
  refreshTokenHash: string;
  refreshTokenExpiresAt: Date;
};

type AccessTokenHeader = {
  alg?: string;
  typ?: string;
  kid?: string;
  jku?: string;
  jwk?: unknown;
  x5u?: string;
};

@Injectable()
export class TokenCryptoService {
  private readonly privateKey:
    string;

  private readonly publicKeys:
    Readonly<
      Record<
        string,
        string
      >
    >;

  constructor(
    private readonly jwtService:
      JwtService,

    private readonly envService:
      EnvService,
  ) {
    this.privateKey =
      Buffer
        .from(
          this.envService
            .jwtPrivateKeyBase64,
          'base64',
        )
        .toString(
          'utf8',
        );

    this.publicKeys =
      this.parsePublicKeys(
        this.envService
          .jwtPublicKeysJson,
      );
  }

  signAccessToken(
    accountId: string,
    sessionId: string,
    accessVersion: number,
  ): string {
    return this.jwtService
      .sign(
        {
          sub:
            accountId,

          sid:
            sessionId,

          ver:
            accessVersion,
        },

        {
          algorithm:
            'ES256',

          privateKey:
            this.privateKey,

          issuer:
            'hoos-api',

          audience:
            'hoos-web',

          expiresIn:
            this.envService
              .accessTokenTtlSeconds,

          jwtid:
            randomUUID(),

          header: {
            alg:
              'ES256',

            typ:
              'at+jwt',

            kid:
              this.envService
                .jwtActiveKid,
          },
        },
      );
  }

  verifyAccessToken(
    token: string,
  ): AccessTokenPayload {
    if (
      token.length === 0 ||
      token.length > 4096
    ) {
      throw new AuthSecurityException();
    }

    const decoded =
      this.jwtService
        .decode(
          token,
          {
            complete:
              true,
          },
        );

    if (
      !decoded ||
      typeof decoded ===
        'string'
    ) {
      throw new AuthSecurityException();
    }

    const header =
      decoded.header as
        AccessTokenHeader;

    if (
      header.alg !==
        'ES256' ||
      header.typ !==
        'at+jwt' ||
      typeof header.kid !==
        'string' ||
      header.kid.length ===
        0 ||
      header.jku !==
        undefined ||
      header.jwk !==
        undefined ||
      header.x5u !==
        undefined
    ) {
      throw new AuthSecurityException();
    }

    const publicKey =
      this.publicKeys[
        header.kid
      ];

    if (!publicKey) {
      throw new AuthSecurityException();
    }

    const payload =
      this.jwtService
        .verify<AccessTokenPayload>(
          token,
          {
            algorithms: [
              'ES256',
            ],

            publicKey,

            issuer:
              'hoos-api',

            audience:
              'hoos-web',
          },
        );

    if (
      typeof payload.sub !==
        'string' ||
      typeof payload.sid !==
        'string' ||
      typeof payload.jti !==
        'string' ||
      !Number.isInteger(
        payload.ver,
      )
    ) {
      throw new AuthSecurityException();
    }

    return payload;
  }

  async generateTokenPair(
    accountId: string,
    sessionId: string,
    accessVersion: number,
  ): Promise<GeneratedTokenPair> {
    const accessToken =
      this.signAccessToken(
        accountId,
        sessionId,
        accessVersion,
      );

    const verified =
      this.verifyAccessToken(
        accessToken,
      );

    const refreshToken =
      this.createOpaqueToken();

    const refreshTokenHash =
      this.fingerprint(
        refreshToken,
      );

    const refreshTokenExpiresAt =
      this.calculateRefreshTokenExpiration();

    return {
      tokenId:
        verified.jti,

      accessToken,

      accessTokenExpiresInSeconds:
        this.envService
          .accessTokenTtlSeconds,

      refreshToken,
      refreshTokenHash,
      refreshTokenExpiresAt,
    };
  }

  createOpaqueToken():
    string {
    return randomBytes(
      32,
    ).toString(
      'base64url',
    );
  }

  generateCsrfToken():
    string {
    return this
      .createOpaqueToken();
  }

  fingerprint(
    value: string,
  ): string {
    return createHmac(
      'sha256',
      this.envService
        .refreshTokenPepper,
    )
      .update(
        value,
      )
      .digest(
        'hex',
      );
  }

  hashRefreshToken(
    refreshToken: string,
  ): string {
    return this.fingerprint(
      refreshToken,
    );
  }

  private calculateRefreshTokenExpiration():
    Date {
    const expiresAt =
      new Date();

    expiresAt.setDate(
      expiresAt.getDate() +
        7,
    );

    return expiresAt;
  }

  private parsePublicKeys(
    value: string,
  ): Readonly<
    Record<
      string,
      string
    >
  > {
    const parsed =
      JSON.parse(
        value,
      ) as Record<
        string,
        string
      >;

    const result:
      Record<
        string,
        string
      > = {};

    for (
      const [
        kid,
        encodedKey,
      ] of Object.entries(
        parsed,
      )
    ) {
      if (
        !/^[A-Za-z0-9_-]{1,64}$/
          .test(
            kid,
          ) ||
        typeof encodedKey !==
          'string'
      ) {
        throw new Error(
          'Invalid JWT public-key configuration',
        );
      }

      result[kid] =
        Buffer
          .from(
            encodedKey,
            'base64',
          )
          .toString(
            'utf8',
          );
    }

    return result;
  }
}