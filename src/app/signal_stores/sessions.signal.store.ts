import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { defaultIfEmpty } from 'rxjs/operators';
import { SessionsService } from '../services/sessions/sessions.service';
import { PaginatedResponse } from '../interfaces/PaginatedResponse';
import { Session } from '../interfaces/Session';

@Injectable({ providedIn: 'root' })
export class SessionsSignalStore {
  public sessionsPage = signal<PaginatedResponse<Session> | Session[] | null>(null);
  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);

  constructor(private sessionsService: SessionsService) {}

  private setLoading(v: boolean) {
    this.loading.set(v);
  }

  private setError(e: any) {
    const msg = e?.message ?? String(e ?? 'Unknown error');
    this.error.set(msg);
  }

  async loadSessions(page: number, pageSize: number, email: string | null) {
    this.setLoading(true);
    this.error.set(null);
    try {
      this.sessionsService.token = localStorage.getItem('token');
      const res = await firstValueFrom(this.sessionsService.getSessionsByUserEmail(page, pageSize, email).pipe(defaultIfEmpty([] as Session[])));
      this.sessionsPage.set(res);
    } catch (err) {
      console.error('SessionsSignalStore.loadSessions error', err);
      this.sessionsPage.set(null);
      this.setError(err);
    } finally {
      this.setLoading(false);
    }
  }

  clear() {
    this.sessionsPage.set(null);
    this.loading.set(false);
    this.error.set(null);
  }
}

