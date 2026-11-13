import { 
  JwtService
 } from '@nestjs/jwt';
import {
   describe,
    expect,
     it,
    beforeEach 
  } from '@jest/globals';

describe('Auth Security Primitives', () => {
  let jwtService: JwtService;
  const secretKey = 'super-secret-test-key-for-security-tests-only';

  beforeEach(() => {
    jwtService = new JwtService({
      secret: secretKey,
      signOptions: { expiresIn: '15m' },
    });
  });

  describe('Validation des JSON Web Tokens (JWT)', () => {
    it('devrait rejeter strictement un JWT utilisant l algorithme "none"', () => {
      // Attaque par falsification d'en-tête (alg: none)
      const maliciousToken = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkF0dGFxdWFudCIsImlhdCI6MTUxNjIzOTAyMn0.';
      
      expect(() => {
        jwtService.verify(maliciousToken);
      }).toThrow();
    });

    it('devrait rejeter un token dont la signature a été altérée', () => {
      const validToken = jwtService.sign({ sub: 1, role: 'user' });
      const tamperedToken = validToken.slice(0, -5) + 'xxxxx';

      expect(() => {
        jwtService.verify(tamperedToken);
      }).toThrow();
    });
  });
});