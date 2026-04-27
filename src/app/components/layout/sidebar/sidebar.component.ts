import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonButtonComponent } from '../../shared/common-button/common-button.component';
import { LanguageSelectorComponent } from '../../shared/language-selector/language-selector.component';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth/auth.service';
import { DarkModeButtonComponent } from '../../shared/dark-mode-button/dark-mode-button.component';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    CommonButtonComponent,
    LanguageSelectorComponent,
    TranslatePipe,
    DarkModeButtonComponent,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: '../../../../styles/styles.css',
  standalone: true,
})
export class SidebarComponent {
  constructor(
    protected router: Router,
    private authService: AuthService,
  ) {}
  isOpened = false;

  protected openOrCloseSidebar() {
    this.isOpened = !this.isOpened;
    try {
      if (this.isOpened) {
        document.body.classList.add('sidebar-open');
      } else {
        document.body.classList.remove('sidebar-open');
      }
    } catch (e) {
      // en entornos donde `document` no esté disponible (SSR) evitamos errores
      // el comportamiento por defecto de la UI permanecerá, pero la clase no se aplicará
    }
  }

  protected logout() {
    this.authService.logout();
    this.router.navigate(['/landing']).then((r) => console.log(r));
  }
}
