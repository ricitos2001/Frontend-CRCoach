import { Component } from '@angular/core';
import { LanguageSelectorComponent } from '../../shared/language-selector/language-selector.component';

@Component({
  selector: 'app-header',
  imports: [LanguageSelectorComponent],
  templateUrl: './header.component.html',
  styleUrl: '../../../../styles/styles.css',
})
export class HeaderComponent {}
