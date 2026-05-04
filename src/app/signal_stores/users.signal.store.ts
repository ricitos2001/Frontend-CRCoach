import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { defaultIfEmpty } from 'rxjs/operators';
import { UsersService } from '../services/users/users.service';
import { User } from '../interfaces/User';

@Injectable({ providedIn: 'root' })
export class UsersSignalStore {
  // Signals exposed as callables: usersStore.user() works in components
  public user = signal<User | null>(null);
  public users = signal<User[] | null>(null);
  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);

  constructor(private usersService: UsersService) {}

  private setLoading(v: boolean) {
    this.loading.set(v);
  }

  private setError(e: any) {
    const msg = e?.message ?? String(e ?? 'Unknown error');
    this.error.set(msg);
  }

  async loadByEmail(email: string | null) {
    if (!email) return;
    this.setLoading(true);
    this.error.set(null);
    try {
      this.usersService.token = localStorage.getItem('token');
      const res = await firstValueFrom(this.usersService.getUser(email).pipe(defaultIfEmpty(null as unknown as User)));
      this.user.set(res);
    } catch (err) {
      console.error('UsersSignalStore.loadByEmail error', err);
      this.user.set(null);
      this.setError(err);
    } finally {
      this.setLoading(false);
    }
  }

  async loadUsers() {
    this.setLoading(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(this.usersService.getUsers().pipe(defaultIfEmpty([] as User[])));
      this.users.set(res);
    } catch (err) {
      console.error('UsersSignalStore.loadUsers error', err);
      this.users.set(null);
      this.setError(err);
    } finally {
      this.setLoading(false);
    }
  }

  setUser(u: User | null) {
    this.user.set(u);
  }

  clear() {
    this.user.set(null);
    this.users.set(null);
    this.loading.set(false);
    this.error.set(null);
  }
}

