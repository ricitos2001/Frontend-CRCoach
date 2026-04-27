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
  standalone: true,
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
        localStorage.setItem('tag', user.playerTag);
        this.profileStore.loadByTag(user.playerTag);
      }
    });
  }
  @ViewChild('headerContent', { static: true }) headerContent!: TemplateRef<any>;

  ngOnInit(): void {
    const email = localStorage.getItem('email');
    const tag = localStorage.getItem('tag');
    if (!email) return;
    this.usersStore.loadByEmail(email);
    if (tag) {
      this.profileStore.loadByTag(tag);
    }
    this.headerContentService.setContent(this.headerContent);
  }
}
