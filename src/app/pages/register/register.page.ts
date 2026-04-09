import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonButtonComponent } from '../../components/shared/common-button/common-button.component';
import { FormInputComponent } from '../../components/shared/form-input/form-input.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordMatch } from '../../validators/password-match.validator';
import { passwordStrength } from '../../validators/password-strength.validator';
import { AsyncValidatorsService } from '../../services/async-validators/async-validators.service';
import { Notification, NotificationsService } from '../../services/notifications/notifications.service';
import { UsersService } from '../../services/users/users.service';
import { ToastService } from '../../services/toast/toast.service';
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
  // Campo tag integrado en el formulario de registro

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private asyncValidators: AsyncValidatorsService,
    private notifications: NotificationsService,
    private usersService: UsersService,
    private toastService: ToastService,
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
        passwordHash: ['', [Validators.required, passwordStrength()]],
        repeatPassword: ['', Validators.required],
        tag: [
          '',
          {
            validators: [],
            asyncValidators: [this.asyncValidators.playerTagExists()],
            updateOn: 'blur',
          },
        ],
        role: 'USER',
        createdAt: new Date(),
        enabled: true,
        acceptTerms: [false, Validators.requiredTrue],
      },
      { validators: passwordMatch('passwordHash', 'repeatPassword') },
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
        const tag = this.registerForm.value.tag;
        if (tag) {
          this.usersService.linkPlayerTag(tag).subscribe({
            next: () => {
              const apiNotification: Notification = {
                title: this.translate.instant(
                  'PAGES.LINK_PLAYER_PROFILE.NOTIFICATION_LINKED_TITLE',
                ),
                message: this.translate.instant(
                  'PAGES.LINK_PLAYER_PROFILE.NOTIFICATION_LINKED_MESSAGE',
                  { tag },
                ),
                createdAt: new Date(),
                userEmail: localStorage.getItem('email') ?? '',
              };
              this.notifications.pushNotifications(apiNotification).subscribe({
                error: (err) => console.warn('Error enviando notificación al API:', err),
              });

              this.toastService.show({
                type: 'success',
                message: this.translate.instant('PAGES.LINK_PLAYER_PROFILE.LINK_SUCCESS_TOAST', {
                  tag,
                }),
                duration: 5000,
              });
            },
            error: (err) => {
              console.warn('Error vinculando perfil tras registro:', err);
              const serverMessage =
                err && err.error && err.error.message ? err.error.message : null;
              const fallback =
                typeof err === 'string' ? err : JSON.stringify(err?.error ?? err ?? '');
              const userMessage =
                serverMessage ??
                fallback ??
                this.translate.instant('PAGES.LINK_PLAYER_PROFILE.LINK_ERROR_TOAST', { tag });
              this.toastService.show({ type: 'error', message: userMessage, duration: 7000 });
            },
          });
        }
        this.router.navigate(['dashboard']).then(() => {});
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
