import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { take, finalize } from 'rxjs/operators';
import { MetricsService } from '../services/metrics/metrics.service';
import { Metric } from '../interfaces/Metric';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class MetricsSignalStore {
  private _metric = signal<Metric | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly metric = this._metric.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor(private metricsService: MetricsService, private translate: TranslateService) {}

  loadMetrics(tag: string) {
    if (!tag) return;
    this._loading.set(true);
    this._error.set(null);
    this.metricsService
      .getMetrics(tag)
      .pipe(take(1), finalize(() => this._loading.set(false)))
      .subscribe({
        next: (m) => this._metric.set(m),
        error: (err) => {
          this._error.set(this.translate.instant('NOTIFICATIONS.METRICS.GET_ERROR'));
          console.warn('MetricsSignalStore.loadMetrics error', err);
        },
      });
  }

  clear() {
    this._metric.set(null);
    this._error.set(null);
  }
}

