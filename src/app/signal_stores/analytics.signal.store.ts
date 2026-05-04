import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { defaultIfEmpty } from 'rxjs/operators';
import { AnalyticsService } from '../services/analytics/analytics.service';
import { WeaknessReport } from '../interfaces/WeaknessReport';
import { ProblematicCardsReport } from '../interfaces/ProblematicCardsReport';
import { SummaryReport } from '../interfaces/SummaryReport';

@Injectable({ providedIn: 'root' })
export class AnalyticsSignalStore {
  public weaknesses = signal<WeaknessReport | null>(null);
  public problematicCards = signal<ProblematicCardsReport | null>(null);
  public summary = signal<SummaryReport | null>(null);

  // Signals for status
  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);

  constructor(private analyticsService: AnalyticsService) {}

  private setLoading(v: boolean) {
    this.loading.set(v);
  }

  private setError(e: any) {
    const msg = e?.message ?? String(e ?? 'Unknown error');
    this.error.set(msg);
  }

  async loadWeaknesses(tag: string, gameMode?: string, from?: string, to?: string, minBattles?: number) {
    if (!tag) return;
    this.setLoading(true);
    this.error.set(null);
    try {
      this.analyticsService.token = localStorage.getItem('token');
      const res = await firstValueFrom(this.analyticsService.getWeaknesses(tag, gameMode, from, to, minBattles).pipe(defaultIfEmpty(null as unknown as WeaknessReport)));
      this.weaknesses.set(res);
    } catch (err) {
      console.error('AnalyticsSignalStore.loadWeaknesses error', err);
      this.weaknesses.set(null);
      this.setError(err);
    } finally {
      this.setLoading(false);
    }
  }

  async loadProblematicCards(tag: string, gameMode?: string, from?: string, to?: string, limit?: number, minAppearances?: number) {
    if (!tag) return;
    this.setLoading(true);
    this.error.set(null);
    try {
      this.analyticsService.token = localStorage.getItem('token');
      const res = await firstValueFrom(this.analyticsService.getProblematicCards(tag, gameMode, from, to, limit, minAppearances).pipe(defaultIfEmpty(null as unknown as ProblematicCardsReport)));
      this.problematicCards.set(res);
    } catch (err) {
      console.error('AnalyticsSignalStore.loadProblematicCards error', err);
      this.problematicCards.set(null);
      this.setError(err);
    } finally {
      this.setLoading(false);
    }
  }

  async loadSummary(tag: string, gameMode?: string, from?: string, to?: string) {
    if (!tag) return;
    this.setLoading(true);
    this.error.set(null);
    try {
      this.analyticsService.token = localStorage.getItem('token');
      const res = await firstValueFrom(this.analyticsService.getSummary(tag, gameMode, from, to).pipe(defaultIfEmpty(null as unknown as SummaryReport)));
      this.summary.set(res);
    } catch (err) {
      console.error('AnalyticsSignalStore.loadSummary error', err);
      this.summary.set(null);
      this.setError(err);
    } finally {
      this.setLoading(false);
    }
  }

  clear() {
    this.weaknesses.set(null);
    this.problematicCards.set(null);
    this.summary.set(null);
    this.loading.set(false);
    this.error.set(null);
  }
}

