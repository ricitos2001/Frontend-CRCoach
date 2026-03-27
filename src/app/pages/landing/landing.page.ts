import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-landing',
  imports: [],
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.css',
})
export class LandingPage {
  protected readonly title = signal('Frontend-CRCoach');
}
