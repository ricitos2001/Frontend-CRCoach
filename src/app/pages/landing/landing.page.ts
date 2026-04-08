import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from '../../services/language/language.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommonButtonComponent } from '../../components/shared/common-button/common-button.component';

@Component({
  selector: 'app-landing',
  imports: [TranslatePipe, CommonButtonComponent],
  templateUrl: './landing.page.html',
  styleUrl: '../../../styles/styles.css',
})
export class LandingPage implements OnInit {
  protected readonly title = signal('Frontend-CRCoach');
  constructor(
    private translate: TranslateService,
  ) {}
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
}
