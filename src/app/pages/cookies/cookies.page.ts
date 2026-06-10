import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-cookies',
  imports: [TranslatePipe],
  templateUrl: './cookies.page.html',
  styleUrl: '../../../styles/styles.css',
  standalone: true,
})
export class CookiesPage {}
