import { Component, inject } from '@angular/core';
import { LanguageSelectorComponent } from '../../shared/language-selector/language-selector.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommonButtonComponent } from '../../shared/common-button/common-button.component';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { HeaderContentService } from '../../../services/header-content/header-content.service';

@Component({
  selector: 'app-header',
  imports: [
    LanguageSelectorComponent,
    CommonButtonComponent,
    TranslatePipe,
    RouterLink,
    NgTemplateOutlet,
    AsyncPipe,
  ],
  templateUrl: './header.component.html',
  styleUrl: '../../../../styles/styles.css',
})
export class HeaderComponent {
  constructor(
    private translate: TranslateService,
    protected router: Router,
    private authService: AuthService,
  ) {}
  headerContentService = inject(HeaderContentService);
  content$ = this.headerContentService.content$;
  getStarted = '';
  logoutText = '';

  ngOnInit() {
    this.setTranslations();
    this.translate.onLangChange.subscribe(() => this.setTranslations());
  }

  private setTranslations() {
    this.getStarted = this.translate.instant('COMPONENTS.SHARED.GET_STARTED');
    this.logoutText = this.translate.instant('COMPONENTS.SHARED.LOGOUT');
  }
}
