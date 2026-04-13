import { Component } from '@angular/core';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  imports: [SidebarComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: '../../../styles/styles.css',
})
export class DashboardPage {}
