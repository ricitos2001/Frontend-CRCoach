import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonButtonComponent } from '../../shared/common-button/common-button.component';
import { LanguageSelectorComponent } from '../../shared/language-selector/language-selector.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, CommonButtonComponent, LanguageSelectorComponent, TranslatePipe],
  templateUrl: './sidebar.component.html',
  styleUrl: '../../../../styles/styles.css',
  standalone: true,
})
export class SidebarComponent {
  constructor(
    private translate: TranslateService,
    protected router: Router,
    private authService: AuthService,
  ) {}
  dashboard = '';
  battles = '';
  weaknesses = '';
  goals = '';
  sessions = '';
  progress = '';
  profile = '';
  logoutText = '';
  isOpened = false;

  ngOnInit() {
    this.setTranslations();
    this.translate.onLangChange.subscribe(() => this.setTranslations());
  }

  protected openOrCloseSidebar() {
    this.isOpened = !this.isOpened;
  }

  protected logout() {
    this.authService.logout();
    this.router.navigate(['/landing']).then((r) => console.log(r));
  }

  private setTranslations() {
    this.dashboard = this.translate.instant('COMPONENTS.LAYOUT.SIDEBAR.DASHBOARD');
    this.battles = this.translate.instant('COMPONENTS.LAYOUT.SIDEBAR.BATTLES');
    this.weaknesses = this.translate.instant('COMPONENTS.LAYOUT.SIDEBAR.WEAKNESSES');
    this.goals = this.translate.instant('COMPONENTS.LAYOUT.SIDEBAR.GOALS');
    this.sessions = this.translate.instant('COMPONENTS.LAYOUT.SIDEBAR.SESSIONS');
    this.progress = this.translate.instant('COMPONENTS.LAYOUT.SIDEBAR.PROGRESS');
    this.profile = this.translate.instant('COMPONENTS.LAYOUT.SIDEBAR.PROFILE');
    this.logoutText = this.translate.instant('COMPONENTS.SHARED.LOGOUT');
  }
}
