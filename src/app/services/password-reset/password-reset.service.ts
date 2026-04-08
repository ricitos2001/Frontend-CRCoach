import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../enviroments/enviroment';

export interface PasswordForgotRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface MessageResponse {
  message: string;
}

export interface TokenValidationResponse {
  valid: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PasswordResetService {
  token = localStorage.getItem('token');
  constructor(private http: HttpClient) {}

  forgotPassword(request: PasswordForgotRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${environment.apiUrl}/api/v1/auth/password/forgot`,
      request,
    );
  }

  verifyToken(token: string): Observable<TokenValidationResponse> {
    const params = new HttpParams().set('token', token);

    return this.http.get<TokenValidationResponse>(
      `${environment.apiUrl}/api/v1/auth/password/verify`,
      { params },
    );
  }

  resetPassword(request: PasswordResetConfirm): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${environment.apiUrl}/api/v1/auth/password/reset`,
      request,
    );
  }
}
