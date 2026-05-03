import { Component, OnInit, effect, ViewChild, TemplateRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UsersSignalStore } from '../../signal_stores/users.signal.store';
import { PlayerProfileSignalStore } from '../../signal_stores/player-profile.signal.store';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { HeaderContentService } from '../../services/header-content/header-content.service';
import { CommonButtonComponent } from '../../components/shared/common-button/common-button.component';
import { UsersService } from '../../services/users/users.service';
import { AuthService } from '../../services/auth/auth.service';
import { ModalComponent } from '../../components/shared/modal/modal.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['../../../styles/styles.css'],
  imports: [SidebarComponent, CommonButtonComponent, RouterLink, ModalComponent, TranslatePipe],
  standalone: true,
})
export class ProfilePage implements OnInit {
  private lastLoadedEmail: string | null = null;
  private lastLoadedTag: string | null = null;
  deleteModalOpen = false;
  constructor(
    public usersStore: UsersSignalStore,
    public profileStore: PlayerProfileSignalStore,
    public headerContentService: HeaderContentService,
    private usersService: UsersService,
    private authService: AuthService,
    private router: Router,
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
  openDeleteModal(): void {
    this.deleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.deleteModalOpen = false;
  }

  removeAccount(): void {
    const user = this.usersStore.user();
    if (!user) return;

    this.usersService.removeUser(user.id).subscribe({
      next: () => {
        // Clear local data and stores, then navigate to landing
        this.authService.removeUserData();
        this.deleteModalOpen = false;
        this.router.navigate(['/landing']).then(() => {});
      },
      error: (err) => {
        console.error('Error borrando cuenta', err);
      },
    });
  }
}
