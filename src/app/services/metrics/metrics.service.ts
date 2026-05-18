import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from '../loading/loading.service';
import { Observable } from 'rxjs';
import { WeaknessReport } from '../../interfaces/WeaknessReport';
import { environment } from '../../../enviroments/enviroment';
import { finalize } from 'rxjs/operators';
import { Metric } from '../../interfaces/Metric';


@Injectable({
  providedIn: 'root',
})
export class MetricsService {
  token = localStorage.getItem('token');

  constructor(
    private http: HttpClient,
    private loadingService: LoadingService,
  ) {}

  getMetrics(tag: string): Observable<Metric> {
    const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
    const encodedTag = encodeURIComponent(normalizedTag);

    return this.http
      .get<Metric>(`${environment.apiUrl}/api/v1/metrics/player/${encodedTag}/summary`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      .pipe(finalize(() => this.loadingService.hide()));
  }
}
