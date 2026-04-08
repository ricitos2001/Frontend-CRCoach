import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthModalService {
  private openModalSource = new Subject<'login' | 'register'>();
  private closeModalSource = new Subject<void>();

  openModal$ = this.openModalSource.asObservable();
  closeModal$ = this.closeModalSource.asObservable();

  open(tab: 'login' | 'register') {
    this.openModalSource.next(tab);
  }

  close() {
    this.closeModalSource.next();
  }
}
