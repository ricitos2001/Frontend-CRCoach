import { Component } from '@angular/core';
import { LanguageSelectorComponent } from '../../shared/language-selector/language-selector.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommonButtonComponent } from '../../shared/common-button/common-button.component';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [LanguageSelectorComponent, CommonButtonComponent, TranslatePipe, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: '../../../../styles/styles.css',
})
export class HeaderComponent {
  constructor(
    private translate: TranslateService,
    protected router: Router,
    private authService: AuthService,
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

  protected logout() {
    this.authService.logout();
    this.router.navigate(['/landing']).then((r) => console.log(r));
  }
}
