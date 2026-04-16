import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';
import { LoadingService } from '../loading/loading.service';
import { User } from '../../interfaces/User';


@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(
    private http: HttpClient,
    private loadingService: LoadingService,
  ) {}
  token = localStorage.getItem('token');

  getUsers(): Observable<User[]> {
    return this.http
      .get<User[]>(`${environment.apiUrl}/api/v1/users`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      .pipe(finalize(() => this.loadingService.hide()));
  }

  getUserById(id: string | null): Observable<User> {
    return this.http
      .get<User>(`${environment.apiUrl}/api/v1/users/id/${id}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      .pipe(finalize(() => this.loadingService.hide()));
  }

  getUser(email: string | null): Observable<User> {
    return this.http
      .get<User>(`${environment.apiUrl}/api/v1/users/email/${email}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      .pipe(finalize(() => this.loadingService.hide()));
  }

  getUserByName(username: string | null): Observable<User> {
    return this.http
      .get<User>(`${environment.apiUrl}/api/v1/users/username/${username}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      .pipe(finalize(() => this.loadingService.hide()));
  }

  editUser(id: string | null, user: User): Observable<User> {
    return this.http
      .put<User>(`${environment.apiUrl}/api/v1/users/${id}`, user, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      .pipe(finalize(() => this.loadingService.hide()));
  }

  removeUser(id: number): Observable<User> {
    return this.http
      .delete<User>(`${environment.apiUrl}/api/v1/users/${id}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      .pipe(finalize(() => this.loadingService.hide()));
  }

  getImageProfile(id: number, cacheBust: boolean = false): Observable<Blob> {
    const url = cacheBust
      ? `${environment.apiUrl}/api/v1/users/${id}/avatar?t=${Date.now()}`
      : `${environment.apiUrl}/api/v1/users/${id}/avatar`;
    return this.http.get(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      responseType: 'blob',
    });
  }

  postImageProfile(id: number, imageFormData: FormData): Observable<any> {
    return this.http
      .post(`${environment.apiUrl}/api/v1/users/${id}/avatar`, imageFormData, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        responseType: 'text' as 'json',
      })
      .pipe(finalize(() => this.loadingService.hide()));
  }
}
