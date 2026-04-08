import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { ToastService } from '../../services/toast/toast.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  const token = localStorage.getItem('token');

  if (!token) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  try {
    const payloadBase64 = token.split('.')[1] || '';
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);

    if (payload && payload.exp && Date.now() / 1000 > payload.exp) {
      auth.removeUserData();
      toast.show({
        type: 'warning',
        message: 'La sesión ha expirado. Vuelva a iniciar sesión.',
        duration: 5000,
      });
      return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }

    return true;
  } catch (e) {
    auth.removeUserData();
    toast.show({
      type: 'warning',
      message: 'La sesión ha expirado. Vuelva a iniciar sesión.',
      duration: 5000,
    });
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }
};
