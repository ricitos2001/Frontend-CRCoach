import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { take, finalize } from 'rxjs/operators';
import { GoalsService } from '../services/goals/goals.service';
import { PaginatedResponse } from '../interfaces/PaginatedResponse';
import { Goal } from '../interfaces/Goal';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class GoalsSignalStore {
  private _goals = signal<PaginatedResponse<Goal> | null>(null);
  private _goal = signal<Goal | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly goals = this._goals.asReadonly();
  readonly goal = this._goal.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor(private goalsService: GoalsService, private translate: TranslateService) {}

  /**
   * Update goals' currentValue based on player profile values.
   * Currently supports metricType 'TROPHIES' (sets currentValue to player's trophies).
   * This will persist changes to backend via GoalsService.editGoal and update local cache.
   */
  updateProgressFromProfile(profile: any) {
    if (!profile) return;
    const page = this._goals();
    if (!page) return;
    const content = Array.isArray((page as any).content) ? (page as any).content : [];
    if (!content || !content.length) return;

    content.forEach((g: any) => {
      try {
        if (!g || !g.id) return;
        // Only updating TROPHIES metric for now
        if ((g.metricType || '').toUpperCase() === 'TROPHIES') {
          const newVal = Number(profile.trophies ?? 0);
          if (Number(g.currentValue ?? 0) !== newVal) {
            const payload = { ...g, currentValue: newVal };
            this.goalsService.editGoal(String(g.id), payload).pipe(take(1)).subscribe({
              next: (updated) => {
                // update local cached page content immutably
                const currentPage = this._goals();
                if (!currentPage) return;
                const updatedContent = (currentPage as any).content.map((cg: any) => (cg.id === updated.id ? updated : cg));
                this._goals.set({ ...(currentPage as any), content: updatedContent });
              },
              error: (err) => console.warn('Failed to update goal progress from profile', err),
            });
          }
        }
      } catch (e) {
        console.warn('updateProgressFromProfile error', e);
      }
    });
  }

  loadGoals(page: number, pageSize: number, email: string | null) {
    this._loading.set(true);
    this._error.set(null);
    this.goalsService
      .getGoalsByUserEmail(page, pageSize, email)
      .pipe(take(1), finalize(() => this._loading.set(false)))
      .subscribe({
        next: (g) => this._goals.set(g),
        error: (err) => {
          this._error.set(this.translate.instant('NOTIFICATIONS.GOALS.GET_ERROR'));
          console.warn('GoalsSignalStore.loadGoals error', err);
        },
      });
  }

  loadGoal(id: string) {
    if (!id) return;
    this._loading.set(true);
    this._error.set(null);
    this.goalsService
      .getGoal(id)
      .pipe(take(1), finalize(() => this._loading.set(false)))
      .subscribe({
        next: (g) => this._goal.set(g),
        error: (err) => {
          this._error.set(this.translate.instant('NOTIFICATIONS.GOALS.GET_ERROR'));
          console.warn('GoalsSignalStore.loadGoal error', err);
        },
      });
  }

  clear() {
    this._goals.set(null);
    this._goal.set(null);
    this._error.set(null);
  }
}

