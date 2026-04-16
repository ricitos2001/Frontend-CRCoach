import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PlayerProfile } from '../../interfaces/PlayerProfile';
import { environment } from '../../../enviroments/enviroment';
import { finalize } from 'rxjs/operators';
import { SummaryReport } from '../../interfaces/SummaryReport';
import { WeaknessReport } from '../../interfaces/WeaknessReport';
import { ProblematicCardsReport } from '../../interfaces/ProblematicCardsReport';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from '../loading/loading.service';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  token = localStorage.getItem('token');

  constructor(
    private http: HttpClient,
    private loadingService: LoadingService,
  ) {}

  getWeaknesses(tag: string): Observable<WeaknessReport> {
    const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
    const encodedTag = encodeURIComponent(normalizedTag);

    return this.http
      .get<WeaknessReport>(`${environment.apiUrl}/api/v1/analytics/player/${encodedTag}/weaknesses`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      .pipe(finalize(() => this.loadingService.hide()));
  }

  getProblematicCards(tag: string): Observable<ProblematicCardsReport> {
    const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
    const encodedTag = encodeURIComponent(normalizedTag);

    return this.http
      .get<ProblematicCardsReport>(
        `${environment.apiUrl}/api/v1/analytics/player/${encodedTag}/cards`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        },
      )
      .pipe(finalize(() => this.loadingService.hide()));
  }

  getSummary(tag: string): Observable<SummaryReport> {
    const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
    const encodedTag = encodeURIComponent(normalizedTag);

    return this.http
      .get<SummaryReport>(`${environment.apiUrl}/api/v1/analytics/player/${encodedTag}/summary`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      .pipe(finalize(() => this.loadingService.hide()));
  }
}
