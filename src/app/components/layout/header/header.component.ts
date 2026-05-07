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
  // media query listener used to detect mobile layout
  private mq?: MediaQueryList;
  public isMobile = false;

  constructor(protected router: Router) {
    // initialize mobile flag and subscribe to changes
    try {
      this.mq = window.matchMedia('(max-width: 720px)');
      this.isMobile = this.mq.matches;
      // update on changes
      const listener = (e: MediaQueryListEvent) => {
        this.isMobile = e.matches;
        // ensure menu is closed when switching to desktop
        if (!this.isMobile) {
          this.menuOpen = false;
        }
      };
      // support both modern and older browsers
      if ((this.mq as any).addEventListener) {
        (this.mq as any).addEventListener('change', listener);
      } else if ((this.mq as any).addListener) {
        // deprecated but supported in some environments
        (this.mq as any).addListener(listener);
      }
    } catch (e) {
      // matchMedia might not be available in some test environments
      this.isMobile = false;
    }
  }
  headerContentService = inject(HeaderContentService);
  content$ = this.headerContentService.content$;
  // Control del menú hamburguesa en landing
  public menuOpen = false;

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
    // Navegar a /landing con fragment y forzar scroll tras la navegación
    this.router.navigate(['/landing'], { fragment }).then(() => {
      // small timeout to ensure elements are rendered
      setTimeout(() => {
        const el = document.getElementById(fragment);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    });
  }
}
