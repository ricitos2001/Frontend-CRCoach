import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { take, finalize, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { BattlesService } from '../services/battles/battles.service';
import { PaginatedResponse } from '../interfaces/PaginatedResponse';
import { Battle } from '../interfaces/Battle';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class BattlesSignalStore {
  private _battles = signal<PaginatedResponse<Battle> | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly battles = this._battles.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor(private battlesService: BattlesService, private translate: TranslateService) {}

  loadByTag(tag: string) {
    if (!tag) return;
    this._loading.set(true);
    this._error.set(null);
    this.battlesService
      .getBattlesByTag(tag)
      .pipe(
        catchError((getBattlesError) =>
          this.battlesService.importBattles(tag).pipe(
            catchError((importError) => {
              console.error('BattlesSignalStore.loadByTag: no se pudo obtener las batallas', {
                tag,
                getBattlesError,
                importError,
              });
              return throwError(() => importError);
            }),
          ),
        ),
        take(1),
        finalize(() => this._loading.set(false)),
      )
      .subscribe({
        next: (res) => {
          if (!res) {
            this._error.set(this.translate.instant('PAGES.LINK_PLAYER_PROFILE.TAG_NOT_FOUND'));
            this._battles.set(null);
            return;
          }
          const maybePag = res as any;
          if (maybePag && maybePag.content) {
            this._battles.set(maybePag as PaginatedResponse<Battle>);
            return;
          }
          const b = res as Battle;
          const pag: PaginatedResponse<Battle> = {
            content: [b],
            pageable: null,
            totalPages: 1,
            totalElements: 1,
            last: true,
            first: true,
            number: 0,
            size: 1,
            numberOfElements: 1,
          };
          this._battles.set(pag);
        },
        error: (err) => {
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
            catchError((importError) => {
              console.error('BattlesSignalStore.importBattles: no se pudo importar las batallas', { tag, importError });
              return throwError(() => importError);
            }),
            finalize(() => this._loading.set(false)),
          )
          .subscribe({
            next: (res) => {
              if (!res) {
                this._error.set(this.translate.instant('PAGES.LINK_PLAYER_PROFILE.TAG_NOT_FOUND'));
                this._battles.set(null);
                return;
              }
              const maybePag = res as any;
              if (maybePag && maybePag.content) {
                this._battles.set(maybePag as PaginatedResponse<Battle>);
                return;
              }
              const b = res as Battle;
              const pag: PaginatedResponse<Battle> = {
                content: [b],
                pageable: null,
                totalPages: 1,
                totalElements: 1,
                last: true,
                first: true,
                number: 0,
                size: 1,
                numberOfElements: 1,
              };
              this._battles.set(pag);
            },
            error: (err) => {
              this._error.set(this.translate.instant('PAGES.LINK_PLAYER_PROFILE.TAG_NOT_FOUND'));
            },
          });
      }


  clear() {
	this._battles.set(null);
	this._error.set(null);
  }
}


