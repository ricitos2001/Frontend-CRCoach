import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from '../loading/loading.service';
import { PaginatedResponse } from '../../interfaces/PaginatedResponse';
import { Battle } from '../../interfaces/Battle';
import { finalize, Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class BattlesService {
  token = localStorage.getItem('token');

  constructor(
    private http: HttpClient,
    private loadingService: LoadingService,
  ) {}

  getBattlesByTag(tag: string): Observable<Battle[]> {
    const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
    const encodedTag = encodeURIComponent(normalizedTag);
    return this.http
      .get<Battle[]>(
        `${environment.apiUrl}/api/v1/battles/myBattles/${encodedTag}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        },
      )
      .pipe(finalize(() => this.loadingService.hide()));
  }

  importBattles(tag: string): Observable<Battle[]> {
    const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
    const encodedTag = encodeURIComponent(normalizedTag);
    return this.http
      .get<Battle[]>(`${environment.apiUrl}/api/v1/battles/import/${encodedTag}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      .pipe(finalize(() => this.loadingService.hide()));
  }
}
