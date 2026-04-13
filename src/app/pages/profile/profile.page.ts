import { Component, OnInit, effect } from '@angular/core';
import { UsersSignalStore } from '../../signal_stores/users.signal.store';
import { PlayerProfileSignalStore } from '../../signal_stores/player-profile.signal.store';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['../../../styles/styles.css'],
  imports: [SidebarComponent],
})
export class ProfilePage implements OnInit {
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
