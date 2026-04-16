import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { take, finalize } from 'rxjs/operators';
import { SessionsService } from '../services/sessions/sessions.service';
import { PaginatedResponse } from '../interfaces/PaginatedResponse';
import { Session } from '../interfaces/Session';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class SessionsSignalStore {
  private _sessions = signal<PaginatedResponse<Session> | null>(null);
  private _session = signal<Session | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly sessions = this._sessions.asReadonly();
  readonly session = this._session.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor(private sessionsService: SessionsService, private translate: TranslateService) {}

  loadSessions(page: number, pageSize: number, email: string | null) {
    this._loading.set(true);
    this._error.set(null);
    this.sessionsService
      .getSessionsByUserEmail(page, pageSize, email)
      .pipe(take(1), finalize(() => this._loading.set(false)))
      .subscribe({
        next: (s) => this._sessions.set(s),
        error: (err) => {
          this._error.set(this.translate.instant('NOTIFICATIONS.SESSIONS.GET_ERROR'));
          console.warn('SessionsSignalStore.loadSessions error', err);
        },
      });
  }

  loadSession(id: string) {
    if (!id) return;
    this._loading.set(true);
    this._error.set(null);
    this.sessionsService
      .getSession(id)
      .pipe(take(1), finalize(() => this._loading.set(false)))
      .subscribe({
        next: (s) => this._session.set(s),
        error: (err) => {
          this._error.set(this.translate.instant('NOTIFICATIONS.SESSIONS.GET_ERROR'));
          console.warn('SessionsSignalStore.loadSession error', err);
        },
      });
  }

  clear() {
    this._sessions.set(null);
    this._session.set(null);
    this._error.set(null);
  }
}

