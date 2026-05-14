import { Injectable, Injector, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { ToastService } from '../services/toast/toast.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private injector = inject(Injector);
  private router = inject(Router);
  private toastService = inject(ToastService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    if (token) {
      const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401 && !req.url.includes('/auth/')) {
            const authService = this.injector.get(AuthService);
            authService.removeUserData();
            this.toastService.show({ type: 'warning', message: 'PAGES.AUTH.SESSION_EXPIRED', duration: 5000 });
            this.router.navigate(['/login']);
          }
          return throwError(() => error);
        })
      );
    }
    return next.handle(req);
  }
}
