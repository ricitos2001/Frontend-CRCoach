import { Component, OnInit } from '@angular/core';
import { LanguageService } from '../../../services/language/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-selector',
  imports: [TranslateModule],
  templateUrl: './language-selector.component.html',
  styleUrl: '../../../../styles/styles.css',
  standalone: true,
})
export class LanguageSelectorComponent implements OnInit {
  constructor(
    private languageService: LanguageService,
    private translate: TranslateService,
  ) {}

  languages = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
  ];

  languageLabel = '';

  currentLang!: string;

  ngOnInit(): void {
    this.currentLang = this.languageService.getCurrentLanguage();
    this.languageService.languageChanges$.subscribe((lang) => {
      if (lang) {
        this.currentLang = lang;
      }
    });
    this.setTranslations();
    this.translate.onLangChange.subscribe(() => this.setTranslations());
  }

  setLanguage(lang: string) {
    this.languageService.setLanguage(lang);
    this.currentLang = lang;
  }

  getFlagPath(lang: string) {
    // Map language codes to flag filenames in assets/img/flags
    const map: { [k: string]: string } = {
      es: 'espana.png',
      en: 'reino-unido.png',
    };
    const file = map[lang] || 'union-europea.png';
    return `/assets/img/flags/${file}`;
  }

  private setTranslations() {
    this.languageLabel = this.translate.instant('COMPONENTS.SHARED.LANGUAGE');
  }
}
