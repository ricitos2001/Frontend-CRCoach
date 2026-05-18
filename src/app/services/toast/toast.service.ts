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
    const now = Date.now();
    const existing = this.toastsSubject.getValue();

    // Normalizar params para comparación (puede ser undefined)
    const newParamsKey = toast.params ? JSON.stringify(toast.params) : '';

    // Evitar duplicados exactos en un umbral corto (3 segundos)
    const recentSame = existing.find((t) => {
      const tParamsKey = t.params ? JSON.stringify(t.params) : '';
      return (
        t.type === toast.type &&
        t.message === toast.message &&
        tParamsKey === newParamsKey &&
        now - t.createdAt < 3000
      );
    });

    if (recentSame) {
      // Ignorar el nuevo toast porque es un duplicado reciente
      return;
    }

    const newToast: ToastMessage = {
      id: crypto.randomUUID(),
      createdAt: now,
      ...toast,
    };

    this.toastsSubject.next([...existing, newToast]);
  }

  dismiss(id: string): void {
    this.toastsSubject.next(this.toastsSubject.getValue().filter((t) => t.id !== id));
  }

  dismissAll(): void {
    this.toastsSubject.next([]);
  }
}
