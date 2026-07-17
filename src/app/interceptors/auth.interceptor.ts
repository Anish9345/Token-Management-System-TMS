import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Look in the browser's memory for the JWT we saved during login
  const token = localStorage.getItem('tms_token');

  // 2. If a token exists, we need to attach it to the request
  if (token) {
    // We cannot modify the original request directly, so we make a clone of it
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}` // This matches exactly what the Node.js bouncer looks for!
      }
    });
    
    // 3. Send the modified clone on its way to the backend
    return next(clonedRequest);
  }

  // 4. If there is no token (like when they are first logging in), just send the normal request
  return next(req);
};