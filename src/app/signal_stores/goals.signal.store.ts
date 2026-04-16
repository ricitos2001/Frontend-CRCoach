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

