import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: '../../../../styles/styles.css',
})
export class FooterComponent {
  constructor(protected router: Router) {}
}
