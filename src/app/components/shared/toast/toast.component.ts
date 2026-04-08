import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastMessage, ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: '../../../../styles/styles.css',
})
export class ToastComponent {
  toasts = signal<ToastMessage[]>([]);

  constructor(private toastService: ToastService) {
    this.toastService.toasts$.subscribe((list) => this.toasts.set(list));

    effect(() => {
      const current = this.toasts();
      current.forEach((t) => {
        if (t.duration && !(t as any).__timeoutSet) {
          (t as any).__timeoutSet = true;
          setTimeout(() => this.toastService.dismiss(t.id), t.duration);
        }
      });
    });
  }

  dismiss(id: string) {
    this.toastService.dismiss(id);
  }
}
