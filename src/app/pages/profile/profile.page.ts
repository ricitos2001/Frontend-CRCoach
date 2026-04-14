import { Component, OnInit, effect, ViewChild, TemplateRef } from '@angular/core';
import { UsersSignalStore } from '../../signal_stores/users.signal.store';
import { PlayerProfileSignalStore } from '../../signal_stores/player-profile.signal.store';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { HeaderContentService } from '../../services/header-content/header-content.service';

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
    public headerContentService: HeaderContentService,
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
