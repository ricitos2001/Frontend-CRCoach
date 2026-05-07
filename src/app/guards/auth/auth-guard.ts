import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { ToastService } from '../../services/toast/toast.service';

// Guardia funcional que valida el token JWT almacenado en localStorage.
// Devuelve `true` si el token es válido, o una `UrlTree` hacia /login cuando no lo es.
export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  // Usar la validación centralizada del AuthService
  if (!auth.isTokenValid()) {
    // Limpiar datos y notificar al usuario
    auth.removeUserData();
    toast.show({ type: 'warning', message: 'PAGES.AUTH.SESSION_EXPIRED', duration: 5000 });
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  // token válido
  return true;
};
