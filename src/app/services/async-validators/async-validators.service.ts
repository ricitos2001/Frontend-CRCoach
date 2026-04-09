import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { of, timer } from 'rxjs';
import { switchMap, map, catchError, take } from 'rxjs/operators';
import { environment } from '../../../enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class AsyncValidatorsService {
  constructor(private http: HttpClient) {}
  token = localStorage.getItem('token');
  emailUnique(excludeValue?: string): AsyncValidatorFn {
    return (control: AbstractControl) => {
      const val = control.value;
      if (!val) return of(null);
      if (excludeValue && val === excludeValue) return of(null); // permitir el valor actual
      return timer(500).pipe(
        switchMap(() =>
          this.http.get<{ exists: boolean }>(
            `${environment.apiUrl}/api/v1/users/email-exists?email=${val}`,
          ),
        ),
        map((res) => (res.exists ? { emailTaken: true } : null)),
        catchError(() => of(null)),
        take(1),
      );
    };
  }

  usernameAvailable(excludeValue?: string): AsyncValidatorFn {
    return (control: AbstractControl) => {
      const val = control.value;
      if (!val || val.length < 3) return of(null);
      if (excludeValue && val === excludeValue) return of(null);
      return timer(500).pipe(
        switchMap(() =>
          this.http.get<{ exists: boolean }>(
            `${environment.apiUrl}/api/v1/users/username-exists?username=${val}`,
          ),
        ),
        map((res) => (res.exists ? { usernameTaken: true } : null)),
        catchError(() => of(null)),
        take(1),
      );
    };
  }

  playerTagExists(excludeValue?: string): AsyncValidatorFn {
    return (control: AbstractControl) => {
      const val = control.value;
      if (!val) return of(null);
      if (excludeValue && val === excludeValue) return of(null);
      return timer(500).pipe(
        switchMap(() =>
          this.http.get<{ exists: boolean }>(
            `${environment.apiUrl}/api/v1/player_profiles/exists/${val}`,
            {
              headers: {
                Authorization: `Bearer ${this.token}`,
              },
            },
          ),
        ),
        // Si existe -> válido (null). Si no existe -> error { tagNotFound: true }
        map((res) => (res.exists ? null : { tagNotFound: true })),
        catchError(() => of(null)),
        take(1),
      );
    };
  }
}
