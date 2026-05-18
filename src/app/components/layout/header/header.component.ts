import { Component, inject, HostListener } from '@angular/core';
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
  private mq?: MediaQueryList;
  public isMobile = false;
  public scrolled = false;

  constructor(protected router: Router) {
    try {
      this.mq = window.matchMedia('(max-width: 720px)');
      this.isMobile = this.mq.matches;
      const listener = (e: MediaQueryListEvent) => {
        this.isMobile = e.matches;
        if (!this.isMobile) {
          this.menuOpen = false;
        }
      };
      if ((this.mq as any).addEventListener) {
        (this.mq as any).addEventListener('change', listener);
      } else if ((this.mq as any).addListener) {
        (this.mq as any).addListener(listener);
      }
    } catch (e) {
      this.isMobile = false;
    }
  }
  headerContentService = inject(HeaderContentService);
  content$ = this.headerContentService.content$;
  public menuOpen = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 10;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  closeMenu() {
    this.menuOpen = false;
  }

  navigateToFragment(fragment: string, event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.router.navigate(['/landing'], { fragment }).then(() => {
      setTimeout(() => {
        const el = document.getElementById(fragment);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    });
  }
}
