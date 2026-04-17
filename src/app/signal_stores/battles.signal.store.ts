import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { take, finalize, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
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
          const maybe = res as any;
          // Si viene un objeto con `content` (respuesta paginada), usamos su contenido
          if (maybe && maybe.content && Array.isArray(maybe.content)) {
            this._battles.set(maybe.content as Battle[]);
            return;
          }
          // Si ya es un array de batallas
          if (Array.isArray(res)) {
            this._battles.set(res as Battle[]);
            return;
          }
          // Si es una sola batalla
          const b = res as Battle;
          this._battles.set([b]);
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
          console.error('BattlesSignalStore.importBattles: no se pudo importar las batallas', {
            tag,
            importError,
          });
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
          const maybe = res as any;
          if (maybe && maybe.content && Array.isArray(maybe.content)) {
            this._battles.set(maybe.content as Battle[]);
            return;
          }
          if (Array.isArray(res)) {
            this._battles.set(res as Battle[]);
            return;
          }
          const b = res as Battle;
          this._battles.set([b]);
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


