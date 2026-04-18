import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonButtonComponent } from '../../shared/common-button/common-button.component';
import { LanguageSelectorComponent } from '../../shared/language-selector/language-selector.component';
import { TranslatePipe } from '@ngx-translate/core';
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
    protected router: Router,
    private authService: AuthService,
  ) {}
  isOpened = false;

  protected openOrCloseSidebar() {
    this.isOpened = !this.isOpened;
  }

  protected logout() {
    this.authService.logout();
    this.router.navigate(['/landing']).then((r) => console.log(r));
  }
}
