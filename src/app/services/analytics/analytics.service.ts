import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

  getWeaknesses(tag: string, gameMode?:string, from?: string, to?: string, minBattles?: number): Observable<WeaknessReport> {
    const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
    const encodedTag = encodeURIComponent(normalizedTag);
    let url = `${environment.apiUrl}/api/v1/analytics/player/${encodedTag}/weaknesses`;
    const params: string[] = [];
    if (gameMode) params.push(`gameMode=${encodeURIComponent(gameMode)}`);
    if (from) params.push(`from=${encodeURIComponent(from)}`);
    if (to) params.push(`to=${encodeURIComponent(to)}`);
    if (minBattles) params.push(`minBattles=${encodeURIComponent(minBattles)}`);
    if (params.length) url += `?${params.join('&')}`;

    return this.http
      .get<WeaknessReport>(url, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      .pipe(finalize(() => this.loadingService.hide()));
  }

  getProblematicCards(tag: string, gameMode?: string, from?: string, to?: string, limit?: number, minAppearances?: number): Observable<ProblematicCardsReport> {
    const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
    const encodedTag = encodeURIComponent(normalizedTag);

    let url = `${environment.apiUrl}/api/v1/analytics/player/${encodedTag}/cards`;
    const params: string[] = [];
    if (gameMode) params.push(`gameMode=${encodeURIComponent(gameMode)}`);
    if (from) params.push(`from=${encodeURIComponent(from)}`);
    if (to) params.push(`to=${encodeURIComponent(to)}`);
    if (limit) params.push(`limit=${encodeURIComponent(limit)}`);
    if (minAppearances) params.push(`minAppearances=${encodeURIComponent(minAppearances)}`);
    if (params.length) url += `?${params.join('&')}`;

    return this.http
      .get<ProblematicCardsReport>(
        url,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        },
      )
      .pipe(finalize(() => this.loadingService.hide()));
  }

  getSummary(tag: string, gameMode?: string, from?: string, to?: string): Observable<SummaryReport> {
    const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
    const encodedTag = encodeURIComponent(normalizedTag);

    let url = `${environment.apiUrl}/api/v1/analytics/player/${encodedTag}/summary`;
    const params: string[] = [];
    if (gameMode) params.push(`gameMode=${encodeURIComponent(gameMode)}`);
    if (from) params.push(`from=${encodeURIComponent(from)}`);
    if (to) params.push(`to=${encodeURIComponent(to)}`);
    if (params.length) url += `?${params.join('&')}`;

    return this.http
      .get<SummaryReport>(url, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      .pipe(finalize(() => this.loadingService.hide()));
  }
}
