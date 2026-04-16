import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { take, finalize } from 'rxjs/operators';
import { AnalyticsService } from '../services/analytics/analytics.service';
import { SummaryReport } from '../interfaces/SummaryReport';
import { WeaknessReport } from '../interfaces/WeaknessReport';
import { ProblematicCardsReport } from '../interfaces/ProblematicCardsReport';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class AnalyticsSignalStore {
  private _summary = signal<SummaryReport | null>(null);
  private _weaknesses = signal<WeaknessReport | null>(null);
  private _problematicCards = signal<ProblematicCardsReport | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly summary = this._summary.asReadonly();
  readonly weaknesses = this._weaknesses.asReadonly();
  readonly problematicCards = this._problematicCards.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor(private analyticsService: AnalyticsService, private translate: TranslateService) {}

  loadSummary(tag: string) {
    if (!tag) return;
    this._loading.set(true);
    this._error.set(null);
    this.analyticsService
      .getSummary(tag)
      .pipe(take(1), finalize(() => this._loading.set(false)))
      .subscribe({
        next: (s) => this._summary.set(s),
        error: (err) => {
          this._error.set(this.translate.instant('NOTIFICATIONS.ANALYTICS.SUMMARY_ERROR'));
          console.warn('AnalyticsSignalStore.loadSummary error', err);
        },
      });
  }

  loadWeaknesses(tag: string) {
    if (!tag) return;
    this._loading.set(true);
    this._error.set(null);
    this.analyticsService
      .getWeaknesses(tag)
      .pipe(take(1), finalize(() => this._loading.set(false)))
      .subscribe({
        next: (w) => this._weaknesses.set(w),
        error: (err) => {
          this._error.set(this.translate.instant('NOTIFICATIONS.ANALYTICS.WEAKNESSES_ERROR'));
          console.warn('AnalyticsSignalStore.loadWeaknesses error', err);
        },
      });
  }

  loadProblematicCards(tag: string) {
    if (!tag) return;
    this._loading.set(true);
    this._error.set(null);
    this.analyticsService
      .getProblematicCards(tag)
      .pipe(take(1), finalize(() => this._loading.set(false)))
      .subscribe({
        next: (p) => this._problematicCards.set(p),
        error: (err) => {
          this._error.set(this.translate.instant('NOTIFICATIONS.ANALYTICS.CARDS_ERROR'));
          console.warn('AnalyticsSignalStore.loadProblematicCards error', err);
        },
      });
  }

  clear() {
    this._summary.set(null);
    this._weaknesses.set(null);
    this._problematicCards.set(null);
    this._error.set(null);
  }
}

