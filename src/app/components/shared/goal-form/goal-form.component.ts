import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GoalsService } from '../../../services/goals/goals.service';
import { Goal } from '../../../interfaces/Goal';
import { CommonButtonComponent } from '../common-button/common-button.component';
import { FormInputComponent } from '../form-input/form-input.component';
import { TranslatePipe } from '@ngx-translate/core';
import { UsersSignalStore } from '../../../signal_stores/users.signal.store';
import { UsersService } from '../../../services/users/users.service';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-goal-form',
  imports: [CommonButtonComponent, FormInputComponent, ReactiveFormsModule, TranslatePipe],
  templateUrl: './goal-form.component.html',
  styleUrl: '../../../../styles/styles.css',
})
export class GoalFormComponent {
  @Input() goal?: Goal | null;
  @Output() saved = new EventEmitter<Goal>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;
  loading = false;
  public metricOptions: string[] = ['TROPHIES', 'WINRATE', 'BATTLES', 'DONATIONS', 'STREAK'];
  public metricOptionsMap: Array<{ value: string; label: string }> = [];

  constructor(
    private fb: FormBuilder,
    private goalsService: GoalsService,
    private usersStore: UsersSignalStore,
    private usersService: UsersService,
    private toast: ToastService,
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(1000)],
      metricType: ['TROPHIES', Validators.required],
      targetValue: [0, [Validators.required, Validators.min(0)]],
      deadline: [''],
    });
    // prepare options map for select (labels are translation keys)
    this.metricOptionsMap = this.metricOptions.map((m) => ({ value: m, label: `PAGES.GOALS.METRYC_OPTIONS.${m}` }));
  }

  ngOnChanges(): void {
    if (this.goal) {
      this.form.patchValue({
        title: this.goal.title ?? '',
        description: this.goal.description ?? '',
        metricType: (this.goal as any).metricType ?? 'TROPHIES',
        targetValue: this.goal.targetValue ?? 0,
        deadline: this.goal.deadline ? new Date(this.goal.deadline).toISOString().substring(0, 10) : '',
      });
    } else {
      this.form.reset({ metricType: 'TROPHIES', targetValue: 0 });
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
      ...this.goal,
      title: this.form.value.title,
      description: this.form.value.description,
      metricType: this.form.value.metricType,
      targetValue: Number(this.form.value.targetValue),
      deadline: this.form.value.deadline ? new Date(this.form.value.deadline).toISOString() : null,
    };

    if (this.goal && this.goal.id) {
      this.goalsService.editGoal(String(this.goal.id), payload).subscribe({
        next: (res) => {
          this.saved.emit(res);
          this.toast.show({ type: 'success', message: 'PAGES.GOALS.UPDATED', duration: 3000 });
          this.loading = false;
        },
        error: (err) => {
          console.error('Error updating goal', err);
          this.toast.show({ type: 'error', message: 'PAGES.GOALS.UPDATE_ERROR', duration: 4000 });
          this.loading = false;
        },
      });
    } else {
      // Ensure defaults for a newly created goal
      payload.status = payload.status ?? 'IN_PROGRESS';
      payload.currentValue = payload.currentValue ?? 0;
      payload.createdAt = payload.createdAt ?? new Date().toISOString();
      // Ensure payload includes user id to avoid DB not-null constraint on user_id
      const currentUser = this.usersStore.user();
      if (currentUser && (currentUser as any).id) {
        payload.user = { id: (currentUser as any).id };
            this.goalsService.createGoal(payload).subscribe({
          next: (res) => {
            this.saved.emit(res);
            this.toast.show({ type: 'success', message: 'PAGES.GOALS.CREATED', duration: 3000 });
            this.loading = false;
          },
          error: (err) => {
            console.error('Error creating goal', err);
            this.toast.show({ type: 'error', message: 'PAGES.GOALS.CREATE_ERROR', duration: 4000 });
            this.loading = false;
          },
        });
      } else {
        // Try to fetch user by email as a fallback
        const email = localStorage.getItem('email');
        if (!email) {
          this.toast.show({ type: 'error', message: 'USER.NOT_LOADED', duration: 4000 });
          this.loading = false;
          return;
        }
        this.usersService.getUser(email).subscribe({
          next: (u) => {
            payload.user = { id: u.id };
            this.goalsService.createGoal(payload).subscribe({
              next: (res) => {
                this.saved.emit(res);
                this.toast.show({ type: 'success', message: 'PAGES.GOALS.CREATED', duration: 3000 });
                this.loading = false;
              },
              error: (err) => {
                console.error('Error creating goal', err);
                this.toast.show({ type: 'error', message: 'PAGES.GOALS.CREATE_ERROR', duration: 4000 });
                this.loading = false;
              },
            });
          },
          error: (err) => {
            console.error('Error fetching user before creating goal', err);
            this.toast.show({ type: 'error', message: 'USER.NOT_LOADED', duration: 4000 });
            this.loading = false;
          },
        });
      }
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
