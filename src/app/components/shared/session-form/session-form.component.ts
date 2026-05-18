import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SessionsService } from '../../../services/sessions/sessions.service';
import { Session } from '../../../interfaces/Session';
import { CommonButtonComponent } from '../common-button/common-button.component';
import { FormInputComponent } from '../form-input/form-input.component';
import { TranslatePipe } from '@ngx-translate/core';
import { UsersSignalStore } from '../../../signal_stores/users.signal.store';
import { UsersService } from '../../../services/users/users.service';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-session-form',
  imports: [CommonButtonComponent, FormInputComponent, ReactiveFormsModule, TranslatePipe],
  templateUrl: './session-form.component.html',
  styleUrl: '../../../../styles/styles.css',
})
export class SessionFormComponent {
  @Input() session?: Session | null;
  @Output() saved = new EventEmitter<Session>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private sessionsService: SessionsService,
    private usersStore: UsersSignalStore,
    private usersService: UsersService,
    private toast: ToastService,
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(150)]],
      notes: ['', Validators.maxLength(2000)],
      mood: ['', Validators.maxLength(50)],
      enfoque: ['', Validators.maxLength(150)],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
    });
  }

  ngOnChanges(): void {
    if (this.session) {
      this.form.patchValue({
        title: this.session.title ?? '',
        notes: this.session.notes ?? '',
        mood: this.session.mood ?? '',
        enfoque: this.session.enfoque ?? '',
        startTime: this.session.startTime
          ? new Date(this.session.startTime).toISOString().substring(0, 16)
          : '',
        endTime: this.session.endTime
          ? new Date(this.session.endTime).toISOString().substring(0, 16)
          : '',
      });
    } else {
      this.form.reset();
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const payload: any = {
      ...this.session,
      title: this.form.value.title,
      notes: this.form.value.notes,
      mood: this.form.value.mood,
      enfoque: this.form.value.enfoque,
      startTime: new Date(this.form.value.startTime).toISOString(),
      endTime: new Date(this.form.value.endTime).toISOString(),
    };

    // Ensure createdAt exists for new sessions (backend mapper expects it)
    if (!payload.createdAt) {
      payload.createdAt = new Date().toISOString();
    }

    const doCreate = (finalPayload: any) => {
      this.sessionsService.createSession(finalPayload).subscribe({
        next: (res) => {
          this.saved.emit(res);
          this.toast.show({ type: 'success', message: 'PAGES.SESSIONS.CREATED', duration: 3000 });
          this.loading = false;
        },
        error: (err) => {
          console.error('Error creating session', err);
          this.toast.show({ type: 'error', message: 'PAGES.SESSIONS.CREATE_ERROR', duration: 4000 });
          this.loading = false;
        },
      });
    };

    const doEdit = (id: string, finalPayload: any) => {
      this.sessionsService.editSession(id, finalPayload).subscribe({
        next: (res) => {
          this.saved.emit(res);
          this.toast.show({ type: 'success', message: 'PAGES.SESSIONS.UPDATED', duration: 3000 });
          this.loading = false;
        },
        error: (err) => {
          console.error('Error updating session', err);
          this.toast.show({ type: 'error', message: 'PAGES.SESSIONS.UPDATE_ERROR', duration: 4000 });
          this.loading = false;
        },
      });
    };

    // Resolve user id: prefer UsersSignalStore, fallback to fetching by email
    const currentUser = this.usersStore.user();
    if (currentUser && (currentUser as any).id) {
      payload.user = { id: (currentUser as any).id };
      // proceed
      if (this.session && this.session.id) {
        doEdit(String(this.session.id), payload);
      } else {
        doCreate(payload);
      }
      return;
    }

    // try localStorage userId first
    const localUserId = localStorage.getItem('userId') || localStorage.getItem('user_id');
    if (localUserId) {
      const parsed = Number(localUserId);
      if (!isNaN(parsed)) payload.user = { id: parsed };
    }

    if (payload.user && payload.user.id) {
      if (this.session && this.session.id) {
        doEdit(String(this.session.id), payload);
      } else {
        doCreate(payload);
      }
      return;
    }

    // As last resort, try load user by email via UsersService
    const email = localStorage.getItem('email');
    if (!email) {
      this.toast.show({ type: 'error', message: 'USER.NOT_LOADED', duration: 4000 });
      this.loading = false;
      return;
    }
    this.usersService.getUser(email).subscribe({
      next: (u) => {
        payload.user = { id: u.id };
        if (this.session && this.session.id) {
          doEdit(String(this.session.id), payload);
        } else {
          doCreate(payload);
        }
      },
      error: (err) => {
        console.error('Error fetching user before creating session', err);
        this.toast.show({ type: 'error', message: 'USER.NOT_LOADED', duration: 4000 });
        this.loading = false;
      },
    });
  }

  onCancel() {
    this.cancel.emit();
  }
}
