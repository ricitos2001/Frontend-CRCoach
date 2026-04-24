import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { take, finalize, catchError, switchMap } from 'rxjs/operators';
import { throwError, timer } from 'rxjs';
import { BattlesService } from '../services/battles/battles.service';
import { Battle } from '../interfaces/Battle';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class BattlesSignalStore {
  private _battles = signal<Battle[] | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly battles = this._battles.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor(
    private battlesService: BattlesService,
    private translate: TranslateService,
  ) {}

  private applyBattlesResponse(res: unknown): boolean {
    if (!res) {
      this._battles.set(null);
      return false;
    }

    const maybe = res as any;
    if (maybe && maybe.content && Array.isArray(maybe.content)) {
      this._battles.set(maybe.content as Battle[]);
      return true;
    }

    if (Array.isArray(res)) {
      this._battles.set(res as Battle[]);
      return true;
    }

    this._battles.set([res as Battle]);
    return true;
  }

  private recoverAfterImportError(tag: string, source: 'loadByTag' | 'importBattles', importError: unknown, getBattlesError?: unknown) {
    return this.battlesService.getBattlesByTag(tag).pipe(
      take(1),
      catchError(() =>
        timer(1200).pipe(
          switchMap(() => this.battlesService.getBattlesByTag(tag)),
          take(1),
          catchError(() => {
            console.error(`BattlesSignalStore.${source}: no se pudo importar ni recuperar las batallas`, {
              tag,
              getBattlesError,
              importError,
            });
            return throwError(() => importError);
          }),
        ),
      ),
    );
  }

  loadByTag(tag: string) {
    if (!tag) return;
    this._loading.set(true);
    this._error.set(null);
    this.battlesService
      .getBattlesByTag(tag)
      .pipe(
        catchError((getBattlesError) =>
          this.battlesService.importBattles(tag).pipe(
            catchError((importError) =>
              this.recoverAfterImportError(tag, 'loadByTag', importError, getBattlesError),
            ),
          ),
        ),
        take(1),
        finalize(() => this._loading.set(false)),
      )
      .subscribe({
        next: (res) => {
          const ok = this.applyBattlesResponse(res);
          if (!ok) {
            this._error.set(this.translate.instant('PAGES.LINK_PLAYER_PROFILE.TAG_NOT_FOUND'));
          } else {
            this._error.set(null);
          }
        },
        error: () => {
          this._error.set(this.translate.instant('PAGES.LINK_PLAYER_PROFILE.TAG_NOT_FOUND'));
        },
      });
  }

  importBattles(tag: string) {
    if (!tag) return;
    this._loading.set(true);
    this._error.set(null);
    this.battlesService
      .importBattles(tag)
      .pipe(
        take(1),
        catchError((importError) => this.recoverAfterImportError(tag, 'importBattles', importError)),
        finalize(() => this._loading.set(false)),
      )
      .subscribe({
        next: (res) => {
          const ok = this.applyBattlesResponse(res);
          if (!ok) {
            this._error.set(this.translate.instant('PAGES.LINK_PLAYER_PROFILE.TAG_NOT_FOUND'));
          } else {
            this._error.set(null);
          }
        },
        error: () => {
          this._error.set(this.translate.instant('PAGES.LINK_PLAYER_PROFILE.TAG_NOT_FOUND'));
        },
      });
  }

  clear() {
    this._battles.set(null);
    this._error.set(null);
  }
}


