import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../enviroments/enviroment';
import { LoadingService } from '../loading/loading.service';
import { PlayerProfile } from '../../interfaces/PlayerProfile';

@Injectable({
  providedIn: 'root',
})
export class PlayerProfilesService {
  token = localStorage.getItem('token');

  constructor(
    private http: HttpClient,
    private loadingService: LoadingService,
  ) {}

  getProfileByTag(tag: string): Observable<PlayerProfile> {
    const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
    const encodedTag = encodeURIComponent(normalizedTag);

    return this.http
      .get<PlayerProfile>(`${environment.apiUrl}/api/v1/player_profiles/tag/${encodedTag}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      .pipe(finalize(() => this.loadingService.hide()));
  }
}
