import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { environment } from '../../../enviroments/enviroment';
import { BattlesSignalStore } from '../../signal_stores/battles.signal.store';
import { GoalsSignalStore } from '../../signal_stores/goals.signal.store';
import { MetricsSignalStore } from '../../signal_stores/metrics.signal.store';
import { PlayerProfileSignalStore } from '../../signal_stores/player-profile.signal.store';
import { SessionsSignalStore } from '../../signal_stores/sessions.signal.store';
import { SnapshotsSignalStore } from '../../signal_stores/snapshots.signal.store';
import { UsersSignalStore } from '../../signal_stores/users.signal.store';
import { AnalyticsSignalStore } from '../../signal_stores/analytics.signal.store';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn = !!localStorage.getItem('token');

  loggedInSubject = new BehaviorSubject<boolean>(!!localStorage.getItem('token'));
  loggedIn$ = this.loggedInSubject.asObservable();

  constructor(
    private http: HttpClient,
    private battlesStore: BattlesSignalStore,
    private goalsStore: GoalsSignalStore,
    private metricsStore: MetricsSignalStore,
    private profileStore: PlayerProfileSignalStore,
    private sessionsStore: SessionsSignalStore,
    private snapshotsStore: SnapshotsSignalStore,
    private usersStore: UsersSignalStore,
    private analyticsStore: AnalyticsSignalStore,
  ) {}

  private extractValue(data: any) {
    // si es un FormGroup, usar data.value; si es un objeto plano, devolverlo tal cual
    return data && data.value !== undefined ? data.value : data;
  }

  login(data: FormGroup | any) {
    const body = this.extractValue(data);
    return this.http.post<any>(`${environment.apiUrl}/api/v1/auth/authenticate`, body);
  }

  register(data: FormGroup | any) {
    const body = this.extractValue(data);
    return this.http.post<any>(`${environment.apiUrl}/api/v1/auth/register`, body);
  }

  logout() {
    // Llamar al endpoint de logout en el backend, pero asegurarnos
    // de limpiar los datos locales y los stores aunque falle la petición.
    this.http.post(`${environment.apiUrl}/api/v1/auth/logout`, {}).subscribe({
      next: () => {
        this.removeUserData();
      },
      error: (err) => {
        console.warn('Logout request failed, clearing local data anyway', err);
        this.removeUserData();
      },
    });
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
    this.isLoggedIn = true;
    this.loggedInSubject.next(true);
  }

  getUserIdFromToken() {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = token.split('.')[1];
      const userData = JSON.parse(atob(payload));
      localStorage.setItem('email', userData.sub);
    }
  }

  removeUserData() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('tag');
    this.isLoggedIn = false;
    this.loggedInSubject.next(false);
    this.battlesStore.clear();
    this.goalsStore.clear();
    this.metricsStore.clear();
    this.profileStore.clear();
    this.sessionsStore.clear();
    this.snapshotsStore.clear();
    this.usersStore.clear();
    this.analyticsStore.clear();
  }
}
