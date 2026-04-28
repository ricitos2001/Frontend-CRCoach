import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonButtonComponent } from '../../shared/common-button/common-button.component';
import { LanguageSelectorComponent } from '../../shared/language-selector/language-selector.component';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth/auth.service';
import { NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
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
export class SidebarComponent implements OnInit, OnDestroy {
  constructor(
    protected router: Router,
    private authService: AuthService,
  ) {}
  isOpened = false;
  private routerSub?: Subscription;

  ngOnInit(): void {
    try {
      document.body.classList.add('has-sidebar');
    } catch (e) {}

    this.routerSub = this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationStart) {
        this.closeSidebar();
      }
    });
  }

  protected openOrCloseSidebar() {
    this.isOpened = !this.isOpened;
    try {
      if (this.isOpened) {
        document.body.classList.add('sidebar-open');
      } else {
        document.body.classList.remove('sidebar-open');
      }
    } catch (e) {}
  }

  /**
   * Cierra el sidebar y asegura que la clase `sidebar-open` se elimine del body.
   * Público/protected porque se llama desde la suscripción al router.
   */
  protected closeSidebar() {
    this.isOpened = false;
    try {
      document.body.classList.remove('sidebar-open');
    } catch (e) {}
  }

  ngOnDestroy(): void {
    try {
      document.body.classList.remove('has-sidebar');
      document.body.classList.remove('sidebar-open');
    } catch (e) {}

    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  protected logout() {
    this.authService.logout();
    this.router.navigate(['/landing']).then((r) => console.log(r));
  }
}
