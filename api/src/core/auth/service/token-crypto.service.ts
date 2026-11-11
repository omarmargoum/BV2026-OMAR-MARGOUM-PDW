import {
  Injectable,
} from '@nestjs/common';

import {
  JwtService,
} from '@nestjs/jwt';

import {
  createHmac,
  randomBytes,
  randomUUID,
} from 'node:crypto';

import {
  EnvService,
} from '../../../common/config/index.js';

export type AccessTokenPayload = {
  sub: string;
  sid: string;
  jti: string;
  ver: number;
};

export type GeneratedTokenPair = {
  tokenId: string;
  accessToken: string;
  accessTokenExpiresInSeconds: number;

  refreshToken: string;
  refreshTokenHash: string;
  refreshTokenExpiresAt: Date;
};

@Injectable()
export class TokenCryptoService {
  constructor(
    private readonly jwtService:
      JwtService,

    private readonly envService:
      EnvService,
  ) {}

  async generateTokenPair(
  
    accountId: string,
    sessionId: string,
    accessVersion: number,
  ): Promise<GeneratedTokenPair> {
    const accessTokenExpiresInSeconds =
      this.envService
        .authAccessTokenExpiresInSeconds;
    const tokenId = randomUUID();  
    const accessToken =
      await this.jwtService.signAsync(
        {
          sub: accountId,
          sid: sessionId,
          jti: tokenId,
         
          ver: accessVersion,
        } satisfies AccessTokenPayload,
        {
          secret:
            this.envService
              .authAccessTokenSecret,

          expiresIn:
            accessTokenExpiresInSeconds,
        },
      );

    const refreshToken =
      this.generateRefreshToken();

    const refreshTokenHash =
      this.hashRefreshToken(
        refreshToken,
      );

    const refreshTokenExpiresAt =
      this.calculateRefreshTokenExpiration();

    return {
      tokenId,
      accessToken,
      accessTokenExpiresInSeconds,
      refreshToken,
      refreshTokenHash,
      refreshTokenExpiresAt,
    };
  }
generateCsrfToken():
  string {
  return randomBytes(
    32,
  ).toString(
    'base64url',
  );
}
  fingerprint(
  value: string,
): string {
  return createHmac(
    'sha256',
    this.envService
      .authRefreshTokenSecret,
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

  async verifyAccessToken(
    accessToken: string,
  ): Promise<AccessTokenPayload> {
    return this.jwtService
      .verifyAsync<AccessTokenPayload>(
        accessToken,
        {
          secret:
            this.envService
              .authAccessTokenSecret,
        },
      );
  }

  private generateRefreshToken():
    string {
    return randomBytes(48)
      .toString('base64url');
  }

  private calculateRefreshTokenExpiration():
    Date {
    const durationInMilliseconds =
      this.envService
        .authRefreshTokenExpiresInDays *
      24 *
      60 *
      60 *
      1000;

    return new Date(
      Date.now() +
        durationInMilliseconds,
    );
  }
}
