import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-notice',
  imports: [TranslatePipe],
  templateUrl: './notice.page.html',
  styleUrl: '../../../styles/styles.css',
  standalone: true,
})
export class NoticePage {}
