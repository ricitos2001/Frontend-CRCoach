import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-terms',
  imports: [TranslatePipe],
  templateUrl: './terms.page.html',
  styleUrl: '../../../styles/styles.css',
  standalone: true,
})
export class TermsPage {}
