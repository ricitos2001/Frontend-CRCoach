import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UsersService } from '../../services/users/users.service';
import { ToastService } from '../../services/toast/toast.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class PlayerTagGuard implements CanActivate {
  constructor(
    private usersService: UsersService,
    private router: Router,
    private toast: ToastService,
    private translate: TranslateService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean> {
    const email = localStorage.getItem('email');

    // Leer flags de la ruta para comportamientos reutilizables
    const requireTag = route.data && route.data['requireTag'] === true;
    const requireNoTag = route.data && route.data['requireNoTag'] === true;

    if (!email) {
      // Si no hay email en localStorage, comportamiento por defecto:
      // - Si la ruta requiere tag, redirigir a link-player-profile
      // - Si la ruta requiere no-tag, permitir (authGuard debe proteger la ruta)
      if (requireTag) {
        this.router.navigate(['/link-player-profile']).then(r => console.log(r));
        return of(false);
      }
      return of(true);
    }

    return this.usersService.getUser(email).pipe(
      map((user) => {
        const hasTag = !!(user && user.playerTag && user.playerTag.trim() !== '');

        if (requireTag) {
          // Ruta que requiere tag -> permitir solo si tiene tag, si no redirigir a link-player-profile
          if (hasTag) {
            return true;
          }
          this.toast.show({
            type: 'info',
            message: this.translate.instant('PAGES.LINK_PLAYER_PROFILE.REQUIRED_ERROR'),
            duration: 3000,
          });
          this.router.navigate(['/link-player-profile']).then((r) => console.log(r));
          return false;
        }

        if (requireNoTag) {
          // Ruta que requiere no-tag -> permitir solo si NO tiene tag, si tiene tag redirigir al dashboard
          if (!hasTag) {
            return true;
          }
          this.toast.show({
            type: 'info',
            message: this.translate.instant('PAGES.LINK_PLAYER_PROFILE.ALREADY_LINKED_TOAST'),
            duration: 3000,
          });
          this.router.navigate(['/dashboard']).then(r => console.log(r));
          return false;
        }

        // Comportamiento por defecto: permitir (si la ruta no declara flags, no interferimos)
        return true;
      }),
      catchError((err) => {
        console.warn(
          'PlayerTagGuard: fallo comprobando usuario, permitiendo acceso por defecto',
          err,
        );
        return of(true);
      }),
    );
  }
}
