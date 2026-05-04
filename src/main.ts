import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { initOtel } from './app/core/otel';

initOtel();

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
