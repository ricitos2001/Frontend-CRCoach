import { Component, OnInit, OnDestroy, AfterViewInit, effect, ViewChild, TemplateRef, HostListener, ElementRef, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerCard } from '../../interfaces/PlayerCard';
import { environment } from '../../../enviroments/enviroment';
import { Router } from '@angular/router';
import { UsersSignalStore } from '../../signal_stores/users.signal.store';
import { PlayerProfileSignalStore } from '../../signal_stores/player-profile.signal.store';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { HeaderContentService } from '../../services/header-content/header-content.service';
import { CommonButtonComponent } from '../../components/shared/common-button/common-button.component';
import { UsersService } from '../../services/users/users.service';
import { AuthService } from '../../services/auth/auth.service';
import { ModalComponent } from '../../components/shared/modal/modal.component';
import { EditUserPage } from '../../components/shared/edit-user/edit-user.page';
import { TranslatePipe } from '@ngx-translate/core';
import { ImportingSpinnerComponent } from '../../components/shared/importing-spinner/importing-spinner.component';
import { CascadeAnimator } from '../../utils/cascade-animation';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['../../../styles/styles.css'],
  imports: [CommonModule, SidebarComponent, CommonButtonComponent, ModalComponent, EditUserPage, TranslatePipe, ImportingSpinnerComponent],
  standalone: true,
})
export class ProfilePage implements OnInit, OnDestroy, AfterViewInit {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private animator?: CascadeAnimator;
  private lastAvatarPath: string | null = null;
  private lastLoadedEmail: string | null = null;
  private lastLoadedTag: string | null = null;
  deleteModalOpen = false;
  editModalOpen = false;
  private editUserSnapshot: string | null = null;
  constructor(
    public usersStore: UsersSignalStore,
    public profileStore: PlayerProfileSignalStore,
    public headerContentService: HeaderContentService,
    private usersService: UsersService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
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
    // React to user changes to load avatar if needed (must be in injection context -> constructor)
    effect(() => {
      const u = this.usersStore.user();
      if (u) {
        this.loadUserAvatar(u as any);
      } else {
        this.clearAvatarObjectUrl();
      }
    });
    // Close edit modal automatically when user object changes after opening edit
    effect(() => {
      const u = this.usersStore.user();
      if (this.editModalOpen && this.editUserSnapshot) {
        try {
          if (JSON.stringify(u ?? {}) !== this.editUserSnapshot) {
            this.closeEditModal();
            this.editUserSnapshot = null;
          }
        } catch (e) {
          // ignore
        }
      }
    });
  }
  @ViewChild('headerContent', { static: true }) headerContent!: TemplateRef<any>;
  @ViewChild('avatarInput') avatarInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('cardDetail') cardDetailRef!: ElementRef<HTMLElement>;

  // estilo dinámico (top/left) para la caja de detalles
  cardDetailStyle: { top?: string; left?: string } = {};
  // avatar object URL (si la imagen requiere Authorization se descarga como Blob)
  avatarObjectUrl: string | null = null;
  avatarLoading = false;

  ngOnInit(): void {
    const email = localStorage.getItem('email');
    if (email && this.lastLoadedEmail !== email) {
      this.lastLoadedEmail = email;
      this.usersStore.loadByEmail(email);
    }

    // Defer setting header content to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => this.headerContentService.setContent(this.headerContent), 0);
  }

  // Trigger file input to select a new avatar
  triggerAvatarInput(event: MouseEvent): void {
    event.stopPropagation();
    try {
      this.avatarInputRef?.nativeElement?.click();
    } catch (e) {
      // ignore
    }
  }

  // Resolver URLs de imágenes: si la URL es absoluta la dejamos, si es relativa la prefijamos con apiUrl
  resolveUrl(url?: string | null, fallback: string = 'assets/img/icons/user.svg'): string {
    if (!url || url === 'null') return fallback;
    // si ya es una URL absoluta
    if (/^https?:\/\//i.test(url)) return url;
    // eliminar barras iniciales y concatenar con el apiUrl
    const cleaned = url.replace(/^\/+/, '');
    const resolved = `${environment.apiUrl}/${cleaned}`;
    const token = localStorage.getItem('token');
    if (token) {
      const sep = resolved.includes('?') ? '&' : '?';
      return `${resolved}${sep}token=${encodeURIComponent(token)}`;
    }
    return resolved;
  }

  // Handle selected file and upload
  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input || !input.files || input.files.length === 0) return;
    const file = input.files[0];
    const user = this.usersStore.user();
    if (!user) return;

    const form = new FormData();
    form.append('file', file);
    this.usersService.postImageProfile(user.id, form).subscribe({
      next: () => {
        // Recargar usuario para obtener la nueva url
        const email = localStorage.getItem('email');
        if (email) this.usersStore.loadByEmail(email);
      },
      error: (err) => {
        console.error('Error subiendo avatar', err);
      },
    });
    // limpiar el input para permitir subir misma imagen de nuevo si se desea
    input.value = '';
  }

  private clearAvatarObjectUrl(): void {
    if (this.avatarObjectUrl) {
      try { URL.revokeObjectURL(this.avatarObjectUrl); } catch (e) {}
      this.avatarObjectUrl = null;
    }
    this.lastAvatarPath = null;
  }

  private avatarUrlWithToken(user: any): string | null {
    const token = localStorage.getItem('token');
    const id = user?.id;
    if (!token || !id) return null;
    const base = `${environment.apiUrl}/api/v1/users/${id}/avatar`;
    return `${base}?token=${encodeURIComponent(token)}&t=${Date.now()}`;
  }

  private loadUserAvatar(user: any): void {
    const idNumber = Number(user?.id);
    if (!Number.isFinite(idNumber)) {
      this.clearAvatarObjectUrl();
      return;
    }

    const path = user?.avatarUrl ?? null;
    if (this.lastAvatarPath === path && this.avatarObjectUrl) return;
    this.lastAvatarPath = path;

    const token = localStorage.getItem('token');
    if (!token) {
      this.avatarObjectUrl = null;
      return;
    }

    this.avatarLoading = true;
    this.usersService.token = token;
    this.usersService.getImageProfile(idNumber, true).subscribe({
      next: (blob) => {
        try {
          if (blob.size > 0 && blob.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
              this.avatarObjectUrl = reader.result as string;
              this.avatarLoading = false;
              try { this.cdr.detectChanges(); } catch (e) {}
            };
            reader.onerror = () => {
              this.avatarObjectUrl = null;
              this.avatarLoading = false;
              try { this.cdr.detectChanges(); } catch (e) {}
            };
            reader.readAsDataURL(blob);
            return;
          }
        } catch (e) {}
        this.avatarObjectUrl = null;
        this.avatarLoading = false;
        try { this.cdr.detectChanges(); } catch (e) {}
      },
      error: () => {
        this.avatarObjectUrl = null;
        this.avatarLoading = false;
        try { this.cdr.detectChanges(); } catch (e) {}
      }
    });
  }

  ngAfterViewInit(): void {
    this.animator = new CascadeAnimator(this.elementRef.nativeElement, [
      { selector: '.player-profile__card.card--stats', stagger: 0.15 },
      { selector: '.deck__images img', stagger: 0.08 },
      { selector: '.player-profile__cards-grid img', stagger: 0.08 },
    ]);
  }

  ngOnDestroy(): void {
    this.clearAvatarObjectUrl();
    this.animator?.destroy();
  }
  openDeleteModal(): void {
    this.deleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.deleteModalOpen = false;
  }

  openEditModal(): void {
    this.editModalOpen = true;
    // store snapshot to detect when user is updated by the edit form
    try {
      this.editUserSnapshot = JSON.stringify(this.usersStore.user() ?? {});
    } catch (e) {
      this.editUserSnapshot = null;
    }
  }

  closeEditModal(): void {
    this.editModalOpen = false;
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

  // --- Card detail logic ---
  selectedCard: PlayerCard | null = null;

  toggleCardDetails(card: PlayerCard, event: MouseEvent): void {
    // evitar que el click burbujee al document y cierre inmediatamente la caja
    event.stopPropagation();
    if (this.selectedCard && this.selectedCard.id === card.id) {
      this.selectedCard = null;
      this.cardDetailStyle = {};
      return;
    }

    // Abrir con la carta seleccionada y calcular posición basada en el elemento clicado
    this.selectedCard = card;
    // elemento HTML clicado
    const target = event.currentTarget as HTMLElement | null;
    if (!target) {
      // fallback: mostrar en derecha
      this.cardDetailStyle = { right: '20px', top: '120px' } as any;
      return;
    }

    const rect = target.getBoundingClientRect();
    // posición inicial: a la derecha del elemento
    let left = rect.right + 8; // espacio a la derecha del elemento
    let top = rect.top;
    // Colocamos como fijo respecto al viewport (position: fixed)
    // después de renderizar medimos la caja y ajustamos si desborda
    this.cardDetailStyle = { left: `${Math.round(left)}px`, top: `${Math.round(top)}px` };
    console.log('initial cardDetailStyle', this.cardDetailStyle);

    // Ajuste fino: esperar al siguiente tick para medir el tamaño real de la caja
    setTimeout(() => {
      try {
        const el = this.cardDetailRef?.nativeElement;
        if (!el) return;
        const boxW = el.offsetWidth;
        const boxH = el.offsetHeight;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // si desborda por la derecha, situar a la izquierda del elemento
        if (left + boxW > vw - 8) {
          left = rect.left - boxW - 8;
        }
        // si sigue desbordando al izquierdo, ajustamos a 8px
        if (left < 8) left = 8;

        // ajustar vertical si desborda por abajo
        if (top + boxH > vh - 8) {
          top = Math.max(8, vh - boxH - 8);
        }

        this.cardDetailStyle = { left: `${Math.round(left)}px`, top: `${Math.round(top)}px` };
      } catch (e) {
        // ignore
      }
    }, 0);
  }

  // Al hacer click en cualquier parte del documento, cerramos la caja
  @HostListener('document:click', ['$event'])
  onDocumentClick(_: MouseEvent): void {
    this.selectedCard = null;
  }
}
