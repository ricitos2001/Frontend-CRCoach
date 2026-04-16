import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { take, finalize } from 'rxjs/operators';
import { SnapshotsService } from '../services/snapshots/snapshots.service';
import { Snapshot } from '../interfaces/Snapshot';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class SnapshotsSignalStore {
  private _snapshots = signal<Snapshot[] | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly snapshots = this._snapshots.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor(private snapshotsService: SnapshotsService, private translate: TranslateService) {}

  loadSnapshots(tag: string) {
    if (!tag) return;
    this._loading.set(true);
    this._error.set(null);
    this.snapshotsService
      .getSnapshots(tag)
      .pipe(take(1), finalize(() => this._loading.set(false)))
      .subscribe({
        next: (s) => this._snapshots.set(s),
        error: (err) => {
          this._error.set(this.translate.instant('NOTIFICATIONS.SNAPSHOTS.GET_ERROR'));
          console.warn('SnapshotsSignalStore.loadSnapshots error', err);
        },
      });
  }

  clear() {
    this._snapshots.set(null);
    this._error.set(null);
  }
}

