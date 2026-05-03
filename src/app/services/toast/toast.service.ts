import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  // message can be either a translation key or a plain string
  message: string;
  // optional params for translation interpolation
  params?: Record<string, any>;
  duration?: number;
  createdAt: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  show(toast: Omit<ToastMessage, 'id' | 'createdAt'>): void {
    const newToast: ToastMessage = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      ...toast,
    };

    this.toastsSubject.next([...this.toastsSubject.getValue(), newToast]);
  }

  dismiss(id: string): void {
    this.toastsSubject.next(this.toastsSubject.getValue().filter((t) => t.id !== id));
  }

  dismissAll(): void {
    this.toastsSubject.next([]);
  }
}
