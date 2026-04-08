import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommonButtonComponent } from '../../components/shared/common-button/common-button.component';
import { AuthModalService } from '../../services/auth-modal/auth-modal.service';
import { AuthModalComponent } from '../../components/shared/auth-modal/auth-modal.component';

@Component({
  selector: 'app-landing',
  imports: [TranslatePipe, CommonButtonComponent, AuthModalComponent],
  templateUrl: './landing.page.html',
  styleUrl: '../../../styles/styles.css',
})
export class LandingPage implements OnInit {
  protected readonly title = signal('Frontend-CRCoach');
  constructor(
    private router: Router,
    private authModalService: AuthModalService,
    private translate: TranslateService,
  ) {}
  @ViewChild('authModal') authModal!: AuthModalComponent;

  helloWorld = '';
  getStarted = '';

  ngOnInit() {
    this.setTranslations();
    this.translate.onLangChange.subscribe(() => this.setTranslations());
  }

  private setTranslations() {
    this.helloWorld = this.translate.instant('PAGES.LANDING.HELLO_WORLD');
    this.getStarted = this.translate.instant('COMPONENTS.SHARED.GET_STARTED');
  }
  openAuthModal(tab: 'login' | 'register' | 'recover-password' = 'register') {
    if (tab === 'recover-password') {
      this.router.navigate(['/recover-password']).then((r) => console.log(r));
      return;
    }
    this.authModalService.open(tab);
  }

  onAuthSuccess() {
    this.router.navigate(['/dashboard']).then((r) => console.log(r));
  }
}
