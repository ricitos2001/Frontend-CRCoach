import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonButtonComponent } from '../../components/shared/common-button/common-button.component';

@Component({
  selector: 'app-landing',
  imports: [TranslatePipe, CommonButtonComponent, RouterLink],
  templateUrl: './landing.page.html',
  styleUrl: '../../../styles/styles.css',
  standalone: true,
})
export class LandingPage {
  protected readonly title = signal('Frontend-CRCoach');
}
