import { Component, effect, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { UsersSignalStore } from '../../signal_stores/users.signal.store';
import { PlayerProfileSignalStore } from '../../signal_stores/player-profile.signal.store';
import { HeaderContentService } from '../../services/header-content/header-content.service';

@Component({
  selector: 'app-dashboard',
  imports: [SidebarComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: '../../../styles/styles.css',
})
export class DashboardPage implements OnInit {
  constructor(
    public usersStore: UsersSignalStore,
    public profileStore: PlayerProfileSignalStore,
    public headerContentService: HeaderContentService
  ) {
    effect(() => {
      const user = this.usersStore.user();
      if (user && user.playerTag && user.playerTag.trim() !== '') {
        this.profileStore.loadByTag(user.playerTag);
      }
      this.profileStore.profile();
    });
  }
  @ViewChild('headerContent', { static: true }) headerContent!: TemplateRef<any>;

  ngOnInit(): void {
    const email = localStorage.getItem('email');
    if (!email) return;
    this.usersStore.loadByEmail(email);
    this.headerContentService.setContent(this.headerContent);
  }
}
