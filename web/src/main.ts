import {
  bootstrapApplication,
} from '@angular/platform-browser';

import {
  appConfig,
} from './app/root/app.config';

import {
  App,
} from './app/root/router';

void bootstrapApplication(
  App,
  appConfig,
);
