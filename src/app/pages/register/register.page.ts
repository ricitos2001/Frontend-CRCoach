import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonButtonComponent } from '../../components/shared/common-button/common-button.component';
import { FormInputComponent } from '../../components/shared/form-input/form-input.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordMatch } from '../../validators/password-match.validator';
import { passwordStrength } from '../../validators/password-strength.validator';
import { AsyncValidatorsService } from '../../services/async-validators/async-validators.service';
import { NotificationsService } from '../../services/notifications/notifications.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BattlesSignalStore } from '../../signal_stores/battles.signal.store';
import { Notification } from '../../interfaces/Notification';
import { PlayerProfileSignalStore } from '../../signal_stores/player-profile.signal.store';
import { ImportStateService } from '../../services/import-state/import-state.service';

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
  standalone: true,
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
    private battlesStore: BattlesSignalStore,
    private profileStore: PlayerProfileSignalStore,
    private importState: ImportStateService,

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
        playerTag: [
          '',
          {
            validators: [Validators.required],
            asyncValidators: [this.asyncValidators.playerTagExists(), this.asyncValidators.playerTagTaken()],
            updateOn: 'blur',
          },
        ],
        role: 'USER',
        createdAt: new Date(),
        enabled: true,
        acceptTerms: [false, [Validators.requiredTrue]],
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
    this.loading = true; // show loader while registering
    this.authService.register(this.registerForm).subscribe({
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
        this.importState.start();
        this.router.navigate(['dashboard']).then(() => {});
        (async () => {
          try {
            const tagFromForm = String(this.registerForm.value.playerTag ?? '').trim();
            const tag = tagFromForm || localStorage.getItem('tag') || '';
            if (tag) {
              await this.profileStore.importProfile(tag);
              await this.battlesStore.importBattles(tag);
            }
          } catch (err) {
            console.warn('Error importing battles or loading metrics after register:', err);
          } finally {
            this.loading = false;
            this.importState.stop();
          }
        })();
      },
      error: (err) => {
        console.error('Error en registro', err);
        this.loading = false;
        this.translate.instant('NOTIFICATIONS.AUTH.REGISTER.ERROR');
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
