import { Component } from '@angular/core';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { RefreshButtonComponent } from '../../components/shared/refresh-button/refresh-button.component';
import { SearcherComponent } from '../../components/shared/searcher/searcher.component';
import { FormInputComponent } from '../../components/shared/form-input/form-input.component';
import { CommonButtonComponent } from '../../components/shared/common-button/common-button.component';

@Component({
  selector: 'app-goals',
  imports: [
    SidebarComponent,
    RefreshButtonComponent,
    SearcherComponent,
    FormInputComponent,
    CommonButtonComponent,
  ],
  templateUrl: './goals.page.html',
  styleUrl: '../../../styles/styles.css',
  standalone: true,
})
export class GoalsPage {}
