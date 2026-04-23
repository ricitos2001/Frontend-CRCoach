import { Component } from '@angular/core';

@Component({
  selector: 'app-dark-mode-button',
  imports: [],
  templateUrl: './dark-mode-button.component.html',
  styleUrl: '../../../../styles/styles.css',
})
export class DarkModeButtonComponent {
  toogled = false;

  changeTheme() {
    this.toogled = !this.toogled;
  }
}
