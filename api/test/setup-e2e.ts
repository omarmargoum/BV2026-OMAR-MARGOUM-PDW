import {
   config 
  } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Charge .env.test s'il existe, sinon ignore l'erreur
const envTestPath = path.resolve(process.cwd(), '.env.test');
if (fs.existsSync(envTestPath)) {
  config({ path: envTestPath, override: true });
}