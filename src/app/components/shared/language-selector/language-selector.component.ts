import { Component, OnInit } from '@angular/core';
import { LanguageService } from '../../../services/language/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-selector',
  imports: [TranslateModule],
  templateUrl: './language-selector.component.html',
  styleUrl: '../../../../styles/styles.css',
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

  private setTranslations() {
    this.languageLabel = this.translate.instant('COMPONENTS.SHARED.LANGUAGE');
  }
}
