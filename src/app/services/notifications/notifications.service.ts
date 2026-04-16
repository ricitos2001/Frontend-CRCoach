import { Injectable } from '@angular/core';
import { Observable, shareReplay, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../enviroments/enviroment';
import { PaginatedResponse } from '../../interfaces/PaginatedResponse';
import { Notification } from '../../interfaces/Notification';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  token = localStorage.getItem('token');
  constructor(private http: HttpClient) {}

  pollNotifications(intervalMs: number, email: string | null): Observable<Notification[]> {
    return timer(0, intervalMs).pipe(
      switchMap(() =>
        this.http.get<PaginatedResponse<Notification>>(
          `${environment.apiUrl}/api/v1/notifications/myNotifications/${email}`,
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          },
        ),
      ),
      map((response) => response.content),
      shareReplay(1),
    );
  }

  pushNotifications(notification: Notification) {
    return this.http.post<Notification>(
      `${environment.apiUrl}/api/v1/notifications`,
      notification,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      },
    );
  }

  getPage(page: number, pageSize: number, email: string | null) {
    const params = new HttpParams().set('page', String(page)).set('pageSize', String(pageSize));

    return this.http.get<PaginatedResponse<Notification>>(
      `${environment.apiUrl}/api/v1/notifications/myNotifications/${email}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        params,
      },
    );
  }
}
