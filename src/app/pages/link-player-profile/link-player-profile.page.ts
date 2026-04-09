
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonButtonComponent } from '../../components/shared/common-button/common-button.component';
import { FormInputComponent } from '../../components/shared/form-input/form-input.component';
import { AsyncValidatorsService } from '../../services/async-validators/async-validators.service';
import { UsersService } from '../../services/users/users.service';
import { NotificationsService, Notification } from '../../services/notifications/notifications.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast/toast.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-link-player-profile',
  imports: [CommonButtonComponent, ReactiveFormsModule, FormInputComponent, TranslatePipe],
  templateUrl: './link-player-profile.page.html',
  styleUrl: '../../../styles/styles.css',
})
export class LinkPlayerProfilePage implements OnInit {
  tagForm: FormGroup;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private asyncValidators: AsyncValidatorsService,
    private usersService: UsersService,
    private notifications: NotificationsService,
    private toastService: ToastService,
    private router: Router,
    private translate: TranslateService,
  ) {
    this.tagForm = this.fb.group({
      tag: this.fb.control('', {
        validators: [Validators.required],
        asyncValidators: [this.asyncValidators.playerTagExists()],
        updateOn: 'blur',
      }),
    });
  }

  ngOnInit(): void {
    const email = localStorage.getItem('email');
    if (!email) {
      return;
    }

    this.usersService.getUser(email).subscribe({
      next: (user) => {
        if (user && user.playerTag && user.playerTag.trim() !== '') {
          // Si ya tiene tag vinculado, redirigir y mostrar toast
          this.toastService.show({
            type: 'info',
            message: this.translate.instant('PAGES.LINK_PLAYER_PROFILE.ALREADY_LINKED_TOAST'),
            duration: 3000,
          });
          this.router.navigate(['/dashboard']).then((r) => console.log(r));
        }
      },
      error: (err) => {
        console.warn('No se pudo comprobar playerTag del usuario:', err);
      },
    });

    this.setTranslations();
    this.translate.onLangChange.subscribe(() => this.setTranslations());
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.tagForm.invalid) {
      this.tagForm.markAllAsTouched();
      return;
    }
    this.submitted = true;

    const tag = this.tagForm.value.tag;
    this.usersService.linkPlayerTag(tag).subscribe({
      next: (res) => {
        console.log('Perfil vinculado:', res);
        // Notificación persistente en backend
        const apiNotification: Notification = {
          title: this.translate.instant('PAGES.LINK_PLAYER_PROFILE.NOTIFICATION_LINKED_TITLE'),
          message: this.translate.instant('PAGES.LINK_PLAYER_PROFILE.NOTIFICATION_LINKED_MESSAGE', { tag }),
          createdAt: new Date(),
          userEmail: localStorage.getItem('email') ?? '',
        };
        this.notifications.pushNotifications(apiNotification).subscribe({
          error: (err) => console.warn('Error enviando notificación al API:', err),
        });

        // Notificación visual inmediata
        this.toastService.show({
          type: 'success',
          message: this.translate.instant('PAGES.LINK_PLAYER_PROFILE.LINK_SUCCESS_TOAST', { tag }),
          duration: 5000,
        });

        // Resetear formulario y estado
        this.tagForm.reset();
        this.submitted = false;
      },
      error: (err) => {
        console.error('Error vinculando perfil:', err);
        // Notificación persistente de error
        const apiNotification: Notification = {
          title: this.translate.instant('PAGES.LINK_PLAYER_PROFILE.NOTIFICATION_ERROR_TITLE'),
          message: this.translate.instant('PAGES.LINK_PLAYER_PROFILE.NOTIFICATION_ERROR_MESSAGE', { tag }),
          createdAt: new Date(),
          userEmail: localStorage.getItem('email') ?? '',
        };
        this.notifications.pushNotifications(apiNotification).subscribe({
          error: (e) => console.warn('Error enviando notificación de error al API:', e),
        });

        this.toastService.show({
          type: 'error',
          message: this.translate.instant('PAGES.LINK_PLAYER_PROFILE.LINK_ERROR_TOAST', { tag }),
          duration: 5000,
        });

        this.submitted = false;
      },
    });
  }

  private setTranslations() {}
}
