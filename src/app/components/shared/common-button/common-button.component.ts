import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-common-button',
  imports: [],
  templateUrl: './common-button.component.html',
  styleUrl: '../../../../styles/styles.css',
})
export class CommonButtonComponent {
  @Input() disabled: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
}
