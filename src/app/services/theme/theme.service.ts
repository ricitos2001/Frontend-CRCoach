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
    const saved = localStorage.getItem(STORAGE_KEY);
    const dark =
      saved === 'true' ||
      (saved === null &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    this.setDark(dark, false);
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
