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
      const normalizedTag = val.startsWith('#') ? val : `#${val}`;
      const encodedTag = encodeURIComponent(normalizedTag);
      // Leer token al momento de la petición (evita token stale)
      const token = localStorage.getItem('token');
      // Debug logs para inspeccionar la petición y la respuesta
      // (se puede eliminar en producción)
      // eslint-disable-next-line no-console
      console.debug('[AsyncValidators] playerTagExists: checking tag', normalizedTag, 'encoded:', encodedTag);
      return timer(500).pipe(
        switchMap(() =>
          this.http.get<any>(
            `${environment.apiUrl}/api/v1/player_profiles/exists/${encodedTag}`,
            {
              headers: token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {},
            },
          ),
        ),
        map((res) => {
          console.debug('[AsyncValidators] playerTagExists: response', res);
          let exists = false;
          if (res === true || res === 'true' || res === 1 || res === '1') {
            exists = true;
          } else if (res && typeof res === 'object' && typeof (res as any).exists !== 'undefined') {
            const v = (res as any).exists;
            exists = typeof v === 'boolean' ? v : v === 'true' || v === '1';
          }
          return exists ? null : { tagNotFound: true };
        }),
        catchError((err) => {
          console.warn('[AsyncValidators] playerTagExists: request error', err);
          return of(null);
        }),
        take(1),
      );
    };
  }
}
