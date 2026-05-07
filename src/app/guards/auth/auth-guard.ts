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

  const token = localStorage.getItem('token');

  // token ausente o valor string 'null' -> redirigir a login
  if (!token || token === 'null') {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  // validar formato básico de JWT (tres partes separadas por '.')
  const parts = token.split('.');
  if (parts.length < 3) {
    // token inválido
    auth.removeUserData();
    toast.show({ type: 'warning', message: 'PAGES.AUTH.SESSION_EXPIRED', duration: 5000 });
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  try {
    const payloadBase64 = parts[1];
    // atob puede lanzar si la cadena no es base64 válida
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);

    // comprobar expiración si existe
    if (payload && payload.exp && Date.now() / 1000 > payload.exp) {
      auth.removeUserData();
      toast.show({ type: 'warning', message: 'PAGES.AUTH.SESSION_EXPIRED', duration: 5000 });
      return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }

    // todo ok
    return true;
  } catch (e) {
    // cualquier error al parsear el token -> limpiar y redirigir
    auth.removeUserData();
    toast.show({ type: 'warning', message: 'PAGES.AUTH.SESSION_EXPIRED', duration: 5000 });
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
};
