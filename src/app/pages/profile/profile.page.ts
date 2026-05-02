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
  private lastLoadedEmail: string | null = null;
  private lastLoadedTag: string | null = null;
  constructor(
    public usersStore: UsersSignalStore,
    public profileStore: PlayerProfileSignalStore,
    public headerContentService: HeaderContentService,
  ) {
    // React to user signal changes, but do not call loadByEmail here (call it once in ngOnInit)
    effect(() => {
      const user = this.usersStore.user();
      if (user && user.playerTag && user.playerTag.trim() !== '') {
        const tag = user.playerTag.trim();
        if (this.lastLoadedTag === tag) return;
        this.lastLoadedTag = tag;
        localStorage.setItem('tag', tag);

        (async () => {
          await this.profileStore.loadByTag(tag);
          const prof = this.profileStore.profile();
          if (!prof) {
            await this.profileStore.importProfile(tag);
          }
        })();
      }
    });
  }
  @ViewChild('headerContent', { static: true }) headerContent!: TemplateRef<any>;

  ngOnInit(): void {
    const email = localStorage.getItem('email');
    if (email && this.lastLoadedEmail !== email) {
      this.lastLoadedEmail = email;
      this.usersStore.loadByEmail(email);
    }

    this.headerContentService.setContent(this.headerContent);
  }
}
