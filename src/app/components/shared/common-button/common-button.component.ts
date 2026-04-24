import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-common-button',
  imports: [RouterModule],
  templateUrl: './common-button.component.html',
  styleUrl: '../../../../styles/styles.css',
  standalone: true,
})
export class CommonButtonComponent {
  @Input() disabled: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() routerLink?: string | any[];
}
