import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginPage } from '../../../pages/login/login.page';
import { RegisterPage } from '../../../pages/register/register.page';
import { AuthModalService } from '../../../services/auth-modal/auth-modal.service';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ModalComponent, LoginPage, RegisterPage],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['../../../../styles/styles.css'],
})
export class AuthModalComponent implements OnInit {
  @Output() authSuccess = new EventEmitter<void>();

  isOpen = false;
  activeTab: 'login' | 'register' = 'register';

  constructor(private authModalService: AuthModalService) {}

  open(tab: 'login' | 'register' = 'register') {
    this.activeTab = tab;
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }

  onChildAuthSuccess() {
    this.close();
    this.authSuccess.emit();
  }

  ngOnInit() {
    this.authModalService.openModal$.subscribe((tab) => {
      this.open(tab);
    });

    this.authModalService.closeModal$.subscribe(() => {
      this.close();
    });
  }
}
