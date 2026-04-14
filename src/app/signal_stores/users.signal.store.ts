import { Injectable } from '@angular/core';
import { signal, computed } from '@angular/core';
import { UsersService } from '../services/users/users.service';
import { User } from '../interfaces/User';
import { ToastService } from '../services/toast/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { take, finalize } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UsersSignalStore {
  private _user = signal<User | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly hasPlayerTag = computed(() => {
	const u = this._user();
	return !!(u && u.playerTag && u.playerTag.trim() !== '');
  });

  constructor(
	private usersService: UsersService,
	private toast: ToastService,
	private translate: TranslateService,
  ) {}

  loadByEmail(email: string) {
	this._loading.set(true);
	this._error.set(null);
	this.usersService.getUser(email)
	  .pipe(take(1), finalize(() => this._loading.set(false)))
	  .subscribe({
		next: (u) => this._user.set(u),
		error: (err) => {
		  this._error.set(this.translate.instant('NOTIFICATIONS.USER.GET_ERROR'));
		  console.warn('UsersSignalStore.loadByEmail error', err);
		},
	  });
  }

  setUser(u: User | null) {
	this._user.set(u);
  }

  clear() {
	this._user.set(null);
	this._error.set(null);
  }

  // Actualizar localmente el user (por ejemplo después de editar perfil)
  updateLocal(user: User) {
	this._user.set(user);
  }
}


