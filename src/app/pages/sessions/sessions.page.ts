import { Component } from '@angular/core';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { RefreshButtonComponent } from '../../components/shared/refresh-button/refresh-button.component';
import { SearcherComponent } from '../../components/shared/searcher/searcher.component';
import { CommonButtonComponent } from '../../components/shared/common-button/common-button.component';

@Component({
  selector: 'app-sessions',
  imports: [SidebarComponent, RefreshButtonComponent, SearcherComponent, CommonButtonComponent],
  templateUrl: './sessions.page.html',
  styleUrl: '../../../styles/styles.css',
  standalone: true,
})
export class SessionsPage {}
