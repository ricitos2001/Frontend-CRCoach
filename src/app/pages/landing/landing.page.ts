import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-landing',
  imports: [RouterOutlet],
  templateUrl: './landing.page.html',
  styleUrl: '../../../styles/styles.css',
})
export class LandingPage {
  protected readonly title = signal('Frontend-CRCoach');
}
