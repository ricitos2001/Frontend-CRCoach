import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  // Lista de idiomas soportados por la aplicación
  private supported = ['es', 'en'];

  // Inicializamos con un valor provisional que proviene de storage o del navegador
  private current = new BehaviorSubject<string>(this.getStoredOrDefault());
  public languageChanges$ = this.current.asObservable();

  constructor(private translate: TranslateService) {}

  private staticStored(): string | null {
    return localStorage.getItem('locale');
  }

  private getStoredOrDefault(): string {
    const stored = this.staticStored();
    if (stored) return this.normalize(stored);
    let navLang = 'en';
    if (typeof navigator !== 'undefined') {
      if (navigator.languages && navigator.languages.length > 0) {
        navLang = navigator.languages[0];
      } else if ((navigator as any).language) {
        navLang = (navigator as any).language;
      }
    }
    const code = this.normalize(navLang);
    return this.supported.includes(code) ? code : 'en';
  }

  /**
   * Inicializa el idioma de la aplicación.
   * Devuelve una promesa que se resuelve cuando las traducciones para el
   * idioma seleccionado han sido cargadas (útil para APP_INITIALIZER).
   */
  async init(): Promise<void> {
    const stored = this.staticStored();
    let lang: string | null;

    if (stored) {
      lang = this.normalize(stored);
    } else {
      let navLang = 'en';
      if (typeof navigator !== 'undefined') {
        if (navigator.languages && navigator.languages.length > 0) {
          navLang = navigator.languages[0];
        } else if ((navigator as any).language) {
          navLang = (navigator as any).language;
        }
      }
      lang = this.normalize(navLang);
    }

    if (!this.supported.includes(lang)) {
      lang = 'en';
    }

    // Esperar a que las traducciones se descarguen antes de continuar
    try {
      await lastValueFrom(this.translate.use(lang));
    } catch (e) {
      // Si falla la carga del idioma solicitado, forzamos 'en' como fallback
      try {
        await lastValueFrom(this.translate.use('en'));
        lang = 'en';
      } catch (_) {
        // Si también falla el fallback, dejamos que la app siga de todos modos
        // pero no bloqueamos eternamente.
      }
    }

    this.current.next(lang);
    localStorage.setItem('locale', lang);
    document.documentElement.lang = lang;
  }

  setLanguage(lang: string) {
    const code = this.normalize(lang);
    const use = this.supported.includes(code) ? code : 'en';

    this.translate.use(use);
    localStorage.setItem('locale', use);
    this.current.next(use);
    document.documentElement.lang = use;
  }

  getCurrentLanguage() {
    return this.current.value;
  }

  private normalize(input?: string | null): string {
    if (!input) return 'en';
    return input.toLowerCase().slice(0, 2);
  }
}
