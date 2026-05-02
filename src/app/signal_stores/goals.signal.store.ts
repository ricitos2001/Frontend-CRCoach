import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GoalsService } from '../services/goals/goals.service';
import { PaginatedResponse } from '../interfaces/PaginatedResponse';
import { Goal } from '../interfaces/Goal';

@Injectable({ providedIn: 'root' })
export class GoalsSignalStore {
  // Store a paginated response or an array
  public goalsPage = signal<PaginatedResponse<Goal> | Goal[] | null>(null);
  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);

  constructor(private goalsService: GoalsService) {}

  private setLoading(v: boolean) {
    this.loading.set(v);
  }

  private setError(e: any) {
    const msg = e?.message ?? String(e ?? 'Unknown error');
    this.error.set(msg);
  }

  async loadGoals(page: number, pageSize: number, email: string | null) {
    this.setLoading(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(this.goalsService.getGoalsByUserEmail(page, pageSize, email));
      this.goalsPage.set(res);
    } catch (err) {
      console.error('GoalsSignalStore.loadGoals error', err);
      this.goalsPage.set(null);
      this.setError(err);
    } finally {
      this.setLoading(false);
    }
  }

  clear() {
    this.goalsPage.set(null);
    this.loading.set(false);
    this.error.set(null);
  }
}

