import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonButtonComponent } from '../../shared/common-button/common-button.component';
import { LanguageSelectorComponent } from '../../shared/language-selector/language-selector.component';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, CommonButtonComponent, LanguageSelectorComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: '../../../../styles/styles.css',
})
export class SidebarComponent {}
