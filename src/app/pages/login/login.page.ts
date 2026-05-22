import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonButtonComponent } from '../../components/shared/common-button/common-button.component';
import { FormInputComponent } from '../../components/shared/form-input/form-input.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordStrength } from '../../validators/password-strength.validator';
import { NotificationsService } from '../../services/notifications/notifications.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BattlesSignalStore } from '../../signal_stores/battles.signal.store';
import { Notification } from '../../interfaces/Notification';
import { PlayerProfileSignalStore } from '../../signal_stores/player-profile.signal.store';
import { UsersSignalStore } from '../../signal_stores/users.signal.store';

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
  loading = false;
  loginError: string | null = null;
  loginForm: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private notifications: NotificationsService,
    private translate: TranslateService,
    private battlesStore: BattlesSignalStore,
    private profileStore: PlayerProfileSignalStore,
    private usersStore: UsersSignalStore,
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
    this.loading = true;
    this.loginError = null;

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
        // After successful login we import battles and fetch profile for the
        // logged-in player's tag so the app has up-to-date data before showing the dashboard.
        (async () => {
          try {
            const email = localStorage.getItem('email');
            if (email) {
              await this.usersStore.loadByEmail(email);
              const user = this.usersStore.user();
              if (user?.playerTag) {
                const tag = user.playerTag.trim();
                localStorage.setItem('tag', tag);
                await this.profileStore.importProfile(tag);
                await this.battlesStore.importBattles(tag);
              }
            }
          } catch (err) {
            console.warn('Error importing battles or loading data after login:', err);
          } finally {
            this.loading = false;
            this.router.navigate(['dashboard']).then(() => {});
          }
        })();
      },
      error: (err) => {
        console.error('Error en login', err);
        this.loginError = this.translate.instant('NOTIFICATIONS.AUTH.LOGIN.ERROR');
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
