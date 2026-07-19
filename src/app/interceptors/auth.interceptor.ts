import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Always fetch the latest token from storage
  const token = localStorage.getItem('tms_token');
  
  if (token) {
    // Clone and attach the Bearer token
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }
  
  // If no token exists, send the request as-is
  return next(req);
};