import { Component } from '@angular/core';
import { LanguageSelectorComponent } from '../../shared/language-selector/language-selector.component';
import { LanguageService } from '../../../services/language/language.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommonButtonComponent } from '../../shared/common-button/common-button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [LanguageSelectorComponent, CommonButtonComponent, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrl: '../../../../styles/styles.css',
})
export class HeaderComponent {
  constructor(private translate: TranslateService, protected router: Router) {}
  getStarted = '';

  ngOnInit() {
    this.setTranslations();
    this.translate.onLangChange.subscribe(() => this.setTranslations());
    console.log(this.router.url);
  }

  private setTranslations() {
    this.getStarted = this.translate.instant('COMPONENTS.SHARED.GET_STARTED');
  }
}
