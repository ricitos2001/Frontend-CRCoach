import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-privacy',
  imports: [TranslatePipe],
  templateUrl: './privacy.page.html',
  styleUrl: '../../../styles/styles.css',
  standalone: true,
})
export class PrivacyPage {}
