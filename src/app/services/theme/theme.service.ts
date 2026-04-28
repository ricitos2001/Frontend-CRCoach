import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const STORAGE_KEY = 'crcoach:darkMode';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private _isDark = new BehaviorSubject<boolean>(false);
  public isDark$ = this._isDark.asObservable();

  constructor() {
    // No eager initialization in constructor. Call `init()` during app
    // bootstrap (APP_INITIALIZER) to ensure the theme is applied before UI
    // renders. Keeping constructor lightweight improves testability.
  }

  /**
   * Inicializa el servicio leyendo el valor persistido y aplicando la clase.
   * Llamar desde APP_INITIALIZER para asegurar que el tema se aplica al arranque.
   */
  init(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const dark =
        saved === 'true' ||
        (saved === null &&
          window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);
      this.setDark(dark, false);
    } catch (e) {
      // Silencioso: si localStorage no está disponible, no hacemos nada.
    }
  }

  toggle() {
    this.setDark(!this._isDark.value);
  }

  setDark(value: boolean, persist = true) {
    this._isDark.next(value);
    this.applyClass(value);
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false');
      } catch {}
    }
  }

  private applyClass(dark: boolean) {
    const el = document.documentElement;
    if (dark) el.classList.add('dark-mode');
    else el.classList.remove('dark-mode');
  }
}
