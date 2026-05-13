import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { LoadingService } from '../loading/loading.service';
import { finalize, Observable } from 'rxjs';
import { PaginatedResponse } from '../../interfaces/PaginatedResponse';
import { Session } from '../../interfaces/Session';
import { environment } from '../../../enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class SessionsService {
  constructor(
    private http: HttpClient,
    private loadingService: LoadingService,
  ) {}
  token = localStorage.getItem('token');

  getSessionsByUserEmail(
    page: number,
    pageSize: number,
    email: string | null,
  ): Observable<PaginatedResponse<Session>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PaginatedResponse<Session>>(
      `${environment.apiUrl}/api/v1/sessions/mySessions/${email}`,
      {
        headers: { Authorization: `Bearer ${this.token}` },
        params,
      },
    );
  }

  getSession(id: string): Observable<Session> {
    this.loadingService.show();
    return this.http
      .get<Session>(`${environment.apiUrl}/api/v1/sessions/id/${id}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      .pipe(finalize(() => this.loadingService.hide()));
  }

  createSession(session: Session): Observable<Session> {
    return this.http.post<Session>(`${environment.apiUrl}/api/v1/sessions`, session, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
  }

  editSession(id: string | null, session: Session): Observable<Session> {
    return this.http.put<Session>(`${environment.apiUrl}/api/v1/sessions/${id}`, session, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
  }

  removeSession(id: string): Observable<Session> {
    return this.http.delete<Session>(`${environment.apiUrl}/api/v1/sessions/${id}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
  }
}
