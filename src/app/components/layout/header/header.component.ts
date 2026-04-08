import { Component } from '@angular/core';
import { LanguageSelectorComponent } from '../../shared/language-selector/language-selector.component';
import { LanguageService } from '../../../services/language/language.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommonButtonComponent } from '../../shared/common-button/common-button.component';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { AuthModalService } from '../../../services/auth-modal/auth-modal.service';

@Component({
  selector: 'app-header',
  imports: [LanguageSelectorComponent, CommonButtonComponent, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrl: '../../../../styles/styles.css',
})
export class HeaderComponent {
  constructor(
    private translate: TranslateService,
    protected router: Router,
    private authService: AuthService,
    private authModalService: AuthModalService,
  ) {}
  getStarted = '';
  logoutText = '';

  ngOnInit() {
    this.setTranslations();
    this.translate.onLangChange.subscribe(() => this.setTranslations());
    console.log(this.router.url);
  }

  private setTranslations() {
    this.getStarted = this.translate.instant('COMPONENTS.SHARED.GET_STARTED');
    this.logoutText = this.translate.instant('COMPONENTS.SHARED.LOGOUT');
  }

  openAuthModal(tab: 'login' | 'register' | 'recover-password' = 'register') {
    if (tab === 'recover-password') {
      this.router.navigate(['/recover-password']).then((r) => console.log(r));
      return;
    }
    this.authModalService.open(tab);
  }

  protected logout() {
    this.authService.logout();
    this.router.navigate(['/landing']).then((r) => console.log(r));
  }
}
