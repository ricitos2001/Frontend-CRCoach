import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { RefreshButtonComponent } from '../../components/shared/refresh-button/refresh-button.component';
import { SearcherComponent } from '../../components/shared/searcher/searcher.component';
import { CommonButtonComponent } from '../../components/shared/common-button/common-button.component';
import { FormInputComponent } from '../../components/shared/form-input/form-input.component';
import { FormsModule } from '@angular/forms';
import { GoalsSignalStore } from '../../signal_stores/goals.signal.store';
import { GoalsService } from '../../services/goals/goals.service';
import { ToastService } from '../../services/toast/toast.service';
import { Goal } from '../../interfaces/Goal';
import { GoalFormComponent } from '../../components/shared/goal-form/goal-form.component';
import { ModalComponent } from '../../components/shared/modal/modal.component';
import { TranslatePipe } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { PaginationComponent } from '../../components/shared/pagination/pagination.component';

@Component({
  selector: 'app-goals',
  imports: [
    SidebarComponent,
    RefreshButtonComponent,
    SearcherComponent,
    FormInputComponent,
    FormsModule,
    CommonButtonComponent,
    TranslatePipe,
    DatePipe,
    GoalFormComponent,
    ModalComponent,
    PaginationComponent,
  ],
  templateUrl: './goals.page.html',
  styleUrl: '../../../styles/styles.css',
  standalone: true,
})
export class GoalsPage implements OnInit {
  public page = 0;
  public pageSize = 10;
  public editingGoal: Goal | null = null;
  public creating = false;
  public selectedStatus: string = 'ALL';
  public statusOptions: string[] = ['ALL', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'FAILED'];
  public statusOptionsMap: Array<{ value: string; label: string }> = [];

  constructor(
    public goalsStore: GoalsSignalStore,
    private goalsService: GoalsService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    const email = localStorage.getItem('email');
    this.goalsStore.loadGoals(this.page, this.pageSize, email);
    this.statusOptionsMap = this.statusOptions.map((s) => ({
      value: s,
      label: `PAGES.GOALS.STATUS.${s}`,
    }));
  }

  prevPage(goalsPage?: any) {
    const current = goalsPage?.number ?? this.page;
    if (current > 0) {
      this.page = current - 1;
      this.reload();
    }
  }

  nextPage(goalsPage?: any) {
    const current = goalsPage?.number ?? this.page;
    const total = goalsPage?.totalPages ?? this.page + 1;
    if (current < total - 1) {
      this.page = current + 1;
      this.reload();
    }
  }

  reload() {
    const email = localStorage.getItem('email');
    this.goalsStore.loadGoals(this.page, this.pageSize, email);
  }

  onStatusChange(status: string) {
    this.selectedStatus = status;
    // reset to first page when changing filter
    this.page = 0;
    this.reload();
  }

  public filteredGoals(goalsPage: any): any[] {
    const arr = this.pageToArray(goalsPage);
    if (!arr || this.selectedStatus === 'ALL') return arr;
    return arr.filter((g: Goal) => (g?.status ?? 'IN_PROGRESS') === this.selectedStatus);
  }

  openCreate() {
    this.creating = true;
    this.editingGoal = null;
  }

  editGoal(goal: Goal) {
    this.editingGoal = goal;
    this.creating = false;
  }

  onGoalSaved(_g: Goal) {
    this.editingGoal = null;
    this.creating = false;
    this.reload();
  }

  onCancel() {
    this.editingGoal = null;
    this.creating = false;
  }

  deleteGoal(goal: Goal) {
    const ok = window.confirm('¿Eliminar objetivo "' + goal.title + '"?');
    if (!ok) return;
    this.goalsService.removeGoal(String(goal.id)).subscribe({
      next: () => {
        this.toast.show({ type: 'success', message: 'PAGES.GOALS.DELETED', duration: 3000 });
        this.reload();
      },
      error: (err) => {
        console.error('Error deleting goal', err);
        this.toast.show({ type: 'error', message: 'PAGES.GOALS.DELETE_ERROR', duration: 4000 });
      },
    });
  }

  pauseGoal(goal: Goal) {
    if (!goal) return;
    if (goal.status === 'PAUSED') return;
    const ok = window.confirm('¿Pausar objetivo "' + goal.title + '"?');
    if (!ok) return;
    const payload: any = { ...goal, status: 'PAUSED' };
    this.goalsService.editGoal(String(goal.id), payload).subscribe({
      next: () => {
        this.toast.show({ type: 'success', message: 'PAGES.GOALS.PAUSED', duration: 3000 });
        this.reload();
      },
      error: (err) => {
        console.error('Error pausing goal', err);
        this.toast.show({ type: 'error', message: 'PAGES.GOALS.PAUSE_ERROR', duration: 4000 });
      },
    });
  }

  resumeGoal(goal: Goal) {
    if (!goal) return;
    if (goal.status === 'IN_PROGRESS') return;
    const ok = window.confirm('¿Reanudar objetivo "' + goal.title + '"?');
    if (!ok) return;
    const payload: any = { ...goal, status: 'IN_PROGRESS' };
    this.goalsService.editGoal(String(goal.id), payload).subscribe({
      next: () => {
        this.toast.show({ type: 'success', message: 'PAGES.GOALS.RESUMED', duration: 3000 });
        this.reload();
      },
      error: (err) => {
        console.error('Error resuming goal', err);
        this.toast.show({ type: 'error', message: 'PAGES.GOALS.RESUME_ERROR', duration: 4000 });
      },
    });
  }

  completeGoal(goal: Goal) {
    if (!goal) return;
    if (goal.status === 'COMPLETED') return;
    const ok = window.confirm('¿Marcar como completado el objetivo "' + goal.title + '"?');
    if (!ok) return;
    const payload: any = { ...goal, status: 'COMPLETED', currentValue: goal.targetValue };
    this.goalsService.editGoal(String(goal.id), payload).subscribe({
      next: () => {
        this.toast.show({ type: 'success', message: 'PAGES.GOALS.COMPLETED', duration: 3000 });
        this.reload();
      },
      error: (err) => {
        console.error('Error completing goal', err);
        this.toast.show({ type: 'error', message: 'PAGES.GOALS.COMPLETE_ERROR', duration: 4000 });
      },
    });
  }

  failGoal(goal: Goal) {
    if (!goal) return;
    if (goal.status === 'FAILED') return;
    const ok = window.confirm('¿Marcar como fallado el objetivo "' + goal.title + '"?');
    if (!ok) return;
    const payload: any = { ...goal, status: 'FAILED' };
    this.goalsService.editGoal(String(goal.id), payload).subscribe({
      next: () => {
        this.toast.show({ type: 'success', message: 'PAGES.GOALS.FAILED', duration: 3000 });
        this.reload();
      },
      error: (err) => {
        console.error('Error failing goal', err);
        this.toast.show({ type: 'error', message: 'PAGES.GOALS.FAIL_ERROR', duration: 4000 });
      },
    });
  }

  // Utility to accept either array or paginated response like in dashboard
  public pageToArray(page: any): any[] {
    if (!page) return [];
    if (Array.isArray(page)) return page;
    if (page.content && Array.isArray(page.content)) return page.content;
    return [];
  }
}
