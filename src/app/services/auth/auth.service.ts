import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { environment } from '../../../enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn = !!localStorage.getItem('token');

  loggedInSubject = new BehaviorSubject<boolean>(!!localStorage.getItem('token'));
  loggedIn$ = this.loggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

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
    return this.http.post(`${environment.apiUrl}/api/v1/auth/logout`, {});
  }

  removeAccount() {
    return this.http.post(`${environment.apiUrl}/api/v1/auth/logout`, {});
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
    this.isLoggedIn = false;
    this.loggedInSubject.next(false);
  }
}
