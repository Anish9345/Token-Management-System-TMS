import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

// 1. Import the HTTP tool, including the new interceptor config tool
import { provideHttpClient, withInterceptors } from '@angular/common/http';

// 2. Import your actual interceptor script
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    // 3. Register the HTTP client and tell it to use your interceptor
    provideHttpClient(withInterceptors([authInterceptor]))         // 2. Added the HTTP client here!
  ]
};
