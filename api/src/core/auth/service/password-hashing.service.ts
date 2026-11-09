import {
  Injectable,
} from '@nestjs/common';

import {
  argon2id,
  hash,
  needsRehash,
  verify,
} from 'argon2';

const ARGON2_MEMORY_COST = 19 * 1024;
const ARGON2_TIME_COST = 2;
const ARGON2_PARALLELISM = 1;
const ARGON2_HASH_LENGTH = 32;

@Injectable()
export class PasswordHashingService {
  async hashPassword(
    plainPassword: string,
  ): Promise<string> {
    return hash(plainPassword, {
      type: argon2id,

      memoryCost:
        ARGON2_MEMORY_COST,

      timeCost:
        ARGON2_TIME_COST,

      parallelism:
        ARGON2_PARALLELISM,

      hashLength:
        ARGON2_HASH_LENGTH,
    });
  }

  async verifyPassword(
    passwordHash: string,
    candidatePassword: string,
  ): Promise<boolean> {
    try {
      return await verify(
        passwordHash,
        candidatePassword,
        
      );
    } catch {
      return false;
    }
  }

  needsRehash(
    passwordHash: string,
  ): boolean {
    try {
      return needsRehash(
        passwordHash,
        {
         

          memoryCost:
            ARGON2_MEMORY_COST,

          timeCost:
            ARGON2_TIME_COST,

          parallelism:
            ARGON2_PARALLELISM,

          
        },
      );
    } catch {
      return true;
    }
  }
}