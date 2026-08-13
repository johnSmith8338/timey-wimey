import { ApplicationConfig, inject, isDevMode, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { AppInitializerSvc } from './services/app-initializer-svc';
import { IndexedDbEngine } from './core/storage/indexed-db.engine';
import { StorageEngine } from './core/storage/storage-engine';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    IndexedDbEngine,
    {
      provide: StorageEngine,
      useExisting: IndexedDbEngine
    },
    provideAppInitializer(() => {
      const initializer = inject(AppInitializerSvc);
      return initializer.initialize();
    })
  ]
};
