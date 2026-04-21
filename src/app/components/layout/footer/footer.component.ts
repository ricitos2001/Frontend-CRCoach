import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrl: '../../../../styles/styles.css',
  standalone: true,
})
export class FooterComponent {
  constructor(protected router: Router) {}
}
