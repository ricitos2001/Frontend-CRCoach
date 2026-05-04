import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { defaultIfEmpty } from 'rxjs/operators';
import { BattlesService } from '../services/battles/battles.service';
import { Battle } from '../interfaces/Battle';

@Injectable({ providedIn: 'root' })
export class BattlesSignalStore {
  public battles = signal<Battle[] | null>(null);
  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);

  constructor(private battlesService: BattlesService) {}

  private setLoading(v: boolean) {
    this.loading.set(v);
  }

  private setError(e: any) {
    const msg = e?.message ?? String(e ?? 'Unknown error');
    this.error.set(msg);
  }

  async loadByTag(tag: string) {
    if (!tag) return;
    this.setLoading(true);
    this.error.set(null);
    try {
      this.battlesService.token = localStorage.getItem('token');
      const res = await firstValueFrom(this.battlesService.getBattlesByTag(tag).pipe(defaultIfEmpty([] as Battle[])));
      this.battles.set(res);
    } catch (err) {
      console.error('BattlesSignalStore.loadByTag error', err);
      this.battles.set(null);
      this.setError(err);
    } finally {
      this.setLoading(false);
    }
  }

  async importBattles(tag: string) {
    if (!tag) return;
    this.setLoading(true);
    this.error.set(null);
    try {
      this.battlesService.token = localStorage.getItem('token');
      // Trigger backend import which may return 202 Accepted with no JSON body.
      await firstValueFrom(this.battlesService.importBattles(tag).pipe(defaultIfEmpty(null as any)));
      // After triggering import, reload the battles list from the API.
      await this.loadByTag(tag);
    } catch (err) {
      console.error('BattlesSignalStore.importBattles error', err);
      this.setError(err);
    } finally {
      this.setLoading(false);
    }
  }

  clear() {
    this.battles.set(null);
    this.loading.set(false);
    this.error.set(null);
  }
}

