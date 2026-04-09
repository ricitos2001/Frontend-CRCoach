import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CommonButtonComponent } from '../../components/shared/common-button/common-button.component';
import { FormInputComponent } from '../../components/shared/form-input/form-input.component';

import { PasswordResetService } from '../../services/password-reset/password-reset.service';
import { passwordStrength } from '../../validators/password-strength.validator';
import { passwordMatch } from '../../validators/password-match.validator';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-recover-password',
  imports: [
    FormInputComponent,
    CommonButtonComponent,
    RouterLink,
    TranslatePipe,
    ReactiveFormsModule,
  ],
  templateUrl: './recover-password.page.html',
  styleUrl: '../../../styles/styles.css',
})
export class RecoverPasswordPage implements OnInit {
  @Output() authSuccess = new EventEmitter<void>();

  submitted = false;
  tokenValid = false;
  token?: string;
  message?: string;
  error?: string;

  recoverPasswordForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private passwordResetService: PasswordResetService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    // Inicializamos un FormGroup vacío temprano para evitar errores si el template
    // renderiza antes de que initEmailForm/initResetForm cree los controles.
    this.recoverPasswordForm = this.fb.group({});
    this.token = this.route.snapshot.queryParamMap.get('token') ?? undefined;

    if (this.token) {
      this.verifyToken(this.token);
    } else {
      this.initEmailForm();
    }
  }

  /* =========================
     FORMULARIOS
     ========================= */

  onSubmit(event: Event): void {
    event.preventDefault();

    if (this.recoverPasswordForm.invalid) {
      this.recoverPasswordForm.markAllAsTouched();
      return;
    }

    this.submitted = true;
    this.error = undefined;
    this.message = undefined;

    if (!this.token) {
      this.sendRecoveryEmail();
    } else {
      this.resetPassword();
    }
  }

  private initEmailForm(): void {
    this.recoverPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  /* =========================
     TOKEN
     ========================= */

  private initResetForm(): void {
    this.recoverPasswordForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, passwordStrength()]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatch('newPassword', 'confirmPassword') },
    );
  }

  /* =========================
     SUBMIT
     ========================= */

  private verifyToken(token: string): void {
    this.passwordResetService.verifyToken(token).subscribe({
      next: (res) => {
        if (!res.valid) {
          this.router.navigate(['/invalid-token']).then(r => console.log(r));
          return;
        }
        this.tokenValid = true;
        this.initResetForm();
      },
      error: () => this.router.navigate(['/invalid-token']),
    });
  }

  private sendRecoveryEmail(): void {
    const { email } = this.recoverPasswordForm.value;

    this.passwordResetService.forgotPassword({ email }).subscribe({
      next: (res) => {
        this.message = res.message || this.translate.instant('PAGES.RECOVER.SUCCESS_EMAIL_SENT');
        this.submitted = false;
      },
      error: () => {
        this.error = this.translate.instant('PAGES.RECOVER.ERROR_PROCESSING_REQUEST');
        this.submitted = false;
      },
    });
  }

  private resetPassword(): void {
    const { newPassword } = this.recoverPasswordForm.value;

    this.passwordResetService.resetPassword({ token: this.token!, newPassword }).subscribe({
      next: (res) => {
        this.message =
          res.message || this.translate.instant('PAGES.RECOVER.SUCCESS_PASSWORD_CHANGED');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: () => {
        this.error = this.translate.instant('PAGES.RECOVER.ERROR_UPDATING_PASSWORD');
        this.submitted = false;
      },
    });
  }
}
