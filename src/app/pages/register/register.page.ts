import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonButtonComponent } from '../../components/shared/common-button/common-button.component';
import { FormInputComponent } from '../../components/shared/form-input/form-input.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordMatch } from '../../validators/password-match.validator';
import { passwordStrength } from '../../validators/password-strength.validator';
import { phoneNumberValidation } from '../../validators/phone-number.validator';
import { AsyncValidatorsService } from '../../services/async-validators/async-validators.service';
import { Notification, NotificationsService } from '../../services/notifications/notifications.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  imports: [
    CommonButtonComponent,
    FormInputComponent,
    ReactiveFormsModule,
    TranslatePipe,
    RouterLink,
  ],
  templateUrl: './register.page.html',
  styleUrl: '../../../styles/styles.css',
})
export class RegisterPage {
  @Output() authSuccess = new EventEmitter<void>();
  submitted = false;
  registerForm: FormGroup;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private asyncValidators: AsyncValidatorsService,
    private notifications: NotificationsService,
    private translate: TranslateService,
  ) {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.maxLength(50)]],
        surnames: ['', [Validators.required, Validators.maxLength(100)]],
        username: [
          '',
          {
            validators: [Validators.required, Validators.maxLength(50)],
            asyncValidators: [this.asyncValidators.usernameAvailable()],
            updateOn: 'blur',
          },
        ],
        email: [
          '',
          {
            validators: [Validators.required, Validators.email, Validators.maxLength(50)],
            asyncValidators: [this.asyncValidators.emailUnique()],
            updateOn: 'blur',
          },
        ],
        phoneNumber: ['', [Validators.required, phoneNumberValidation()]],
        passwordHash: ['', [Validators.required, passwordStrength()]],
        repeatPassword: ['', Validators.required],
        role: 'USER',
        createdAt: new Date(),
        enabled: true
      },
      { validators: passwordMatch('password', 'repeatPassword') },
    );
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.submitted = true;

    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.authService.saveToken(res.token);
        this.authService.getUserIdFromToken();
        this.authSuccess.emit();
        const apiNotification: Notification = {
          title: this.translate.instant('NOTIFICATIONS.AUTH.REGISTER.TITLE'),
          message: this.translate.instant('NOTIFICATIONS.AUTH.REGISTER.MESSAGE', {
            email: this.registerForm.value.email,
          }),
          createdAt: new Date(),
          userEmail: this.registerForm.value.email,
        };
        this.notifications.pushNotifications(apiNotification).subscribe({
          error: (err) => {
            console.warn('Error enviando notificación al API:', err);
          },
        });
        this.router.navigate(['dashboard']).then((r) => console.log(r));
      },
      error: (err) => {
        console.error('Error en registro', err);
        this.translate.instant('NOTIFICATIONS.AUTH.REGISTER.ERROR');
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
