# Security & Penetration Tests

This directory contains automated security tests and hardening verifications for the HOOS NestJS application.
# Suite de Tests de Sécurité - NestJS

Ce dossier regroupe l'ensemble des tests automatisés vérifiant la robustesse de l'application face aux vecteurs d'attaque courants.

## Structure des fichiers
- **`auth-security.spec.ts`** : Tests unitaires ciblés sur les primitives cryptographiques et les jetons (validation rigoureuse des JWT, attaques par algorithme `none`, en-têtes suspects).
- **`security-e2e.spec.ts`** : Tests de bout en bout (E2E) simulant des scénarios d'attaque réels (guards de validation d'origine, politiques CSRF, vol et rotation de refresh tokens, limitation de débit).

## Exécution
Pour lancer la suite de sécurité de manière indépendante :
\`\`\`bash
npm run test:security
\`\`\`
*(avec le script configuré dans le package.json pointant vers `jest --config ./test/security/jest-security.json`)*