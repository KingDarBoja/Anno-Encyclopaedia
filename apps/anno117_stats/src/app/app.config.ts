import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  provideClientHydration,
  withEventReplay,
  withNoIncrementalHydration,
} from '@angular/platform-browser';
import { MATERIAL_ANIMATIONS } from '@angular/material/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay(), withNoIncrementalHydration()),
    provideBrowserGlobalErrorListeners(),
    {
      provide: MATERIAL_ANIMATIONS,
      useValue: { animationsDisabled: true },
    },
    provideRouter(appRoutes),
    provideHttpClient(withFetch()),
  ],
};
