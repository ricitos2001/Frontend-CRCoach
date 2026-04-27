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
import { SessionFormComponent } from '../../components/shared/session-form/session-form.component';

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

  constructor(public sessionsStore: SessionsSignalStore, private sessionsService: SessionsService) {}

  ngOnInit(): void {
    const email = localStorage.getItem('email');
    this.sessionsStore.loadSessions(this.page, this.pageSize, email);
  }

  prevPage(sessionsPage?: any) {
    const current = sessionsPage?.number ?? this.page;
    if (current > 0) {
      this.page = current - 1;
      this.reload();
    }
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
      next: () => this.reload(),
      error: (err) => console.error('Error deleting session', err),
    });
  }

  public pageToArray(page: any): any[] {
    if (!page) return [];
    if (Array.isArray(page)) return page;
    if (page.content && Array.isArray(page.content)) return page.content;
    return [];
  }
}
