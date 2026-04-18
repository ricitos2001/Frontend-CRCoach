import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonButtonComponent } from '../../components/shared/common-button/common-button.component';
import { FormInputComponent } from '../../components/shared/form-input/form-input.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordStrength } from '../../validators/password-strength.validator';
import { NotificationsService } from '../../services/notifications/notifications.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Notification } from '../../interfaces/Notification';

@Component({
  selector: 'app-login',
  imports: [
    CommonButtonComponent,
    TranslatePipe,
    ReactiveFormsModule,
    FormInputComponent,
    RouterLink,
  ],
  templateUrl: './login.page.html',
  styleUrl: '../../../styles/styles.css',
  standalone: true,
})
export class LoginPage {
  @Output() authSuccess = new EventEmitter<void>();
  submitted = false;
  loginForm: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private notifications: NotificationsService,
    private translate: TranslateService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordStrength()]],
    });
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.submitted = true;

    this.authService.login(this.loginForm).subscribe({
      next: (res) => {
        this.authService.saveToken(res.token);
        this.authService.getUserIdFromToken();
        this.authSuccess.emit();
        const apiNotification: Notification = {
          title: this.translate.instant('NOTIFICATIONS.AUTH.LOGIN.TITLE'),
          message: this.translate.instant('NOTIFICATIONS.AUTH.LOGIN.MESSAGE', {
            email: this.loginForm.value.email,
          }),
          createdAt: new Date(),
          userEmail: this.loginForm.value.email,
        };
        this.notifications.pushNotifications(apiNotification).subscribe({
          error: (err) => {
            console.warn('Error enviando notificación al API:', err);
          },
        });
        this.router.navigate(['dashboard']).then((r) => console.log(r));
      },
      error: (err) => {
        console.error('Error en login', err);
        this.translate.instant('NOTIFICATIONS.AUTH.LOGIN.ERROR');
      },
    });
  }
}
