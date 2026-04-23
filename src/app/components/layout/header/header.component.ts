import { Component, inject } from '@angular/core';
import { LanguageSelectorComponent } from '../../shared/language-selector/language-selector.component';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonButtonComponent } from '../../shared/common-button/common-button.component';
import { Router, RouterLink } from '@angular/router';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { HeaderContentService } from '../../../services/header-content/header-content.service';
import { DarkModeButtonComponent } from '../../shared/dark-mode-button/dark-mode-button.component';

@Component({
  selector: 'app-header',
  imports: [
    LanguageSelectorComponent,
    CommonButtonComponent,
    TranslatePipe,
    RouterLink,
    NgTemplateOutlet,
    AsyncPipe,
    DarkModeButtonComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: '../../../../styles/styles.css',
  standalone: true,
})
export class HeaderComponent {
  constructor(protected router: Router) {}
  headerContentService = inject(HeaderContentService);
  content$ = this.headerContentService.content$;
}
