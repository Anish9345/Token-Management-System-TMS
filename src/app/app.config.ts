import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

// 1. Import the HTTP tool, including the new interceptor config tool
import { provideHttpClient, withInterceptors } from '@angular/common/http';

// 2. Import your actual interceptor script
import { authInterceptor } from './interceptors/auth.interceptor';
import { DatabaseService, initializeApp } from './services/database.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    
    // Add the APP_INITIALIZER to trigger the profile fetch on app load
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [DatabaseService],
      multi: true
    }
  ]
};
