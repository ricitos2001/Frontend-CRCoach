import { Component } from '@angular/core';
import { ThemeService } from '../../../services/theme/theme.service';

@Component({
  selector: 'app-dark-mode-button',
  imports: [],
  templateUrl: './dark-mode-button.component.html',
  styleUrl: '../../../../styles/styles.css',
})
export class DarkModeButtonComponent {
  toogled = false;

  constructor(private darkMode: ThemeService) {
    this.darkMode.isDark$.subscribe((v) => (this.toogled = v));
  }

  changeTheme() {
    this.darkMode.toggle();
  }
}
