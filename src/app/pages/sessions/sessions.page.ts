import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { RefreshButtonComponent } from '../../components/shared/refresh-button/refresh-button.component';
import { SearcherComponent } from '../../components/shared/searcher/searcher.component';
import { CommonButtonComponent } from '../../components/shared/common-button/common-button.component';
import { SessionsSignalStore } from '../../signal_stores/sessions.signal.store';
import { TranslatePipe } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { Session } from '../../interfaces/Session';
import { SessionsService } from '../../services/sessions/sessions.service';
import { ToastService } from '../../services/toast/toast.service';
import { SessionFormComponent } from '../../components/shared/session-form/session-form.component';
import { ModalComponent } from '../../components/shared/modal/modal.component';
import { PaginationComponent } from '../../components/shared/pagination/pagination.component';

@Component({
  selector: 'app-sessions',
  imports: [
    SidebarComponent,
    RefreshButtonComponent,
    SearcherComponent,
    CommonButtonComponent,
    TranslatePipe,
    DatePipe,
    SessionFormComponent,
    ModalComponent,
    PaginationComponent,
  ],
  templateUrl: './sessions.page.html',
  styleUrl: '../../../styles/styles.css',
  standalone: true,
})
export class SessionsPage implements OnInit {
  public page = 0;
  public pageSize = 10;
  public editingSession: Session | null = null;
  public creating = false;
  public expandedSessionId: string | number | null = null;

  constructor(
    public sessionsStore: SessionsSignalStore,
    private sessionsService: SessionsService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    const email = localStorage.getItem('email');
    // initial load only when email present (avoid duplicate calls if already loaded elsewhere)
    if (email) {
      this.sessionsStore.loadSessions(this.page, this.pageSize, email);
    }
  }

  prevPage(sessionsPage?: any) {
    const current = sessionsPage?.number ?? this.page;
    if (current > 0) {
      this.page = current - 1;
      this.reload();
    }
  }

  /**
   * Toggle expand/collapse for a session to show more details.
   * If the session is already expanded, collapse it; otherwise expand it.
   */
  viewDetails(s: Session) {
    if (!s) return;
    this.expandedSessionId = this.expandedSessionId === s.id ? null : s.id;
  }


  nextPage(sessionsPage?: any) {
    const current = sessionsPage?.number ?? this.page;
    const total = sessionsPage?.totalPages ?? this.page + 1;
    if (current < total - 1) {
      this.page = current + 1;
      this.reload();
    }
  }

  reload() {
    const email = localStorage.getItem('email');
    this.sessionsStore.loadSessions(this.page, this.pageSize, email);
  }

  openCreate() {
    this.creating = true;
    this.editingSession = null;
  }

  editSession(s: Session) {
    this.editingSession = s;
    this.creating = false;
  }

  onSessionSaved(_s: Session) {
    this.editingSession = null;
    this.creating = false;
    this.reload();
  }

  onCancel() {
    this.editingSession = null;
    this.creating = false;
  }

  deleteSession(s: Session) {
    const ok = window.confirm('¿Eliminar sesión "' + s.title + '"?');
    if (!ok) return;
    this.sessionsService.removeSession(String(s.id)).subscribe({
      next: () => {
        this.toast.show({ type: 'success', message: 'PAGES.SESSIONS.DELETED', duration: 3000 });
        this.reload();
      },
      error: (err) => {
        console.error('Error deleting session', err);
        this.toast.show({ type: 'error', message: 'PAGES.SESSIONS.DELETE_ERROR', duration: 4000 });
      },
    });
  }

  public pageToArray(page: any): any[] {
    if (!page) return [];
    if (Array.isArray(page)) return page;
    if (page.content && Array.isArray(page.content)) return page.content;
    return [];
  }
}
