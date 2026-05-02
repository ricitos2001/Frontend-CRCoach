import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MetricsService } from '../services/metrics/metrics.service';
import { Metric } from '../interfaces/Metric';

@Injectable({ providedIn: 'root' })
export class MetricsSignalStore {
  public metric = signal<Metric | null>(null);
  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);

  constructor(private metricsService: MetricsService) {}

  private setLoading(v: boolean) {
    this.loading.set(v);
  }

  private setError(e: any) {
    const msg = e?.message ?? String(e ?? 'Unknown error');
    this.error.set(msg);
  }

  async loadMetrics(tag: string) {
    if (!tag) return;
    this.setLoading(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(this.metricsService.getMetrics(tag));
      this.metric.set(res);
    } catch (err) {
      console.error('MetricsSignalStore.loadMetrics error', err);
      this.metric.set(null);
      this.setError(err);
    } finally {
      this.setLoading(false);
    }
  }

  clear() {
    this.metric.set(null);
    this.loading.set(false);
    this.error.set(null);
  }
}

