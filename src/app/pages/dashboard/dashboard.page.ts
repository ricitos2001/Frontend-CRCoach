import { Component, effect, OnInit } from '@angular/core';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { UsersSignalStore } from '../../signal_stores/users.signal.store';
import { PlayerProfileSignalStore } from '../../signal_stores/player-profile.signal.store';

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
  ) {
    effect(() => {
      const user = this.usersStore.user();
      if (user && user.playerTag && user.playerTag.trim() !== '') {
        this.profileStore.loadByTag(user.playerTag);
      }
      this.profileStore.profile();
    });
  }

  ngOnInit(): void {
    const email = localStorage.getItem('email');
    if (!email) return;
    this.usersStore.loadByEmail(email);
  }
}
