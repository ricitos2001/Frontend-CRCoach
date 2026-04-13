import { Component } from '@angular/core';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';

@Component({
  selector: 'app-goals',
  imports: [SidebarComponent],
  templateUrl: './goals.page.html',
  styleUrl: '../../../styles/styles.css',
})
export class GoalsPage {}
