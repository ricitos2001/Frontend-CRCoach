import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { PlayerProfile } from '../interfaces/PlayerProfile';
import { PlayerProfilesService } from '../services/player-profiles/player-profiles.service';
import { take, finalize } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class PlayerProfileSignalStore {
  private _profile = signal<PlayerProfile | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly profile = this._profile.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor(private playerProfilesService: PlayerProfilesService, private translate: TranslateService) {}

  loadByTag(tag: string) {
    if (!tag) return;
    this._loading.set(true);
    this._error.set(null);
    this.playerProfilesService
      .getProfileByTag(tag)
      .pipe(
        take(1),
        finalize(() => this._loading.set(false)),
      )
      .subscribe({
        next: (p) => {
          this._profile.set(p);
        },
        error: (err) => {
          this._error.set(
            this.translate.instant('PAGES.LINK_PLAYER_PROFILE.TAG_NOT_FOUND') ||
              'Profile not found',
          );
          console.warn('PlayerProfileSignalStore.loadByTag error', err);
        },
      });
  }

  clear() {
    this._profile.set(null);
    this._error.set(null);
  }
}

