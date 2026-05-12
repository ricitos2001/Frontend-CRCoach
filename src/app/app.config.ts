import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  LOCALE_ID,
  importProvidersFrom,
  provideAppInitializer,
  inject,
} from '@angular/core';
import { ThemeService } from './services/theme/theme.service';
import { LanguageService } from './services/language/language.service';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TRANSLATE_HTTP_LOADER_CONFIG, TranslateHttpLoader } from '@ngx-translate/http-loader';

registerLocaleData(localeEs);

export function HttpLoaderFactory() {
  return new TranslateHttpLoader();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    { provide: LOCALE_ID, useValue: 'es-ES' },
    {
      provide: TRANSLATE_HTTP_LOADER_CONFIG,
      useValue: { prefix: '/assets/i18n/', suffix: '.json' },
    },
    // Inicializar tema en el arranque de la app (síncrono, muy rápido)
    provideAppInitializer(() => {
      const theme = inject(ThemeService);
      return theme.init();
    }),
    // Inicializar idioma SIN bloqueo: se hará desde el componente raíz
    // de forma diferida para no retrasar el primer renderizado de la app.
    // De esta forma, las traducciones se cargan en segundo plano.
    provideHttpClient(),
    // Registrar interceptor que añade Authorization cuando hay token en localStorage
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      }),
    ),
  ],
};
