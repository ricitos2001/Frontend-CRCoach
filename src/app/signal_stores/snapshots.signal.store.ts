import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SnapshotsService } from '../services/snapshots/snapshots.service';
import { Snapshot } from '../interfaces/Snapshot';

@Injectable({ providedIn: 'root' })
export class SnapshotsSignalStore {
  public snapshots = signal<Snapshot[] | null>(null);
  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);

  constructor(private snapshotsService: SnapshotsService) {}

  private setLoading(v: boolean) {
    this.loading.set(v);
  }

  private setError(e: any) {
    const msg = e?.message ?? String(e ?? 'Unknown error');
    this.error.set(msg);
  }

  async loadSnapshots(tag: string) {
    if (!tag) return;
    this.setLoading(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(this.snapshotsService.getSnapshots(tag));
      this.snapshots.set(res);
    } catch (err) {
      console.error('SnapshotsSignalStore.loadSnapshots error', err);
      this.snapshots.set(null);
      this.setError(err);
    } finally {
      this.setLoading(false);
    }
  }

  clear() {
    this.snapshots.set(null);
    this.loading.set(false);
    this.error.set(null);
  }
}

