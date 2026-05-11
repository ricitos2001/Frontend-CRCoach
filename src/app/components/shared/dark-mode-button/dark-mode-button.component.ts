import { Component, Input } from '@angular/core';
import { ThemeService } from '../../../services/theme/theme.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dark-mode-button',
  imports: [TranslateModule],
  templateUrl: './dark-mode-button.component.html',
  styleUrl: '../../../../styles/styles.css',
})
export class DarkModeButtonComponent {
  toogled = false;
  @Input() tabindex?: number;

  constructor(private darkMode: ThemeService) {
    this.darkMode.isDark$.subscribe((v) => (this.toogled = v));
  }

  changeTheme() {
    this.darkMode.toggle();
  }
}
