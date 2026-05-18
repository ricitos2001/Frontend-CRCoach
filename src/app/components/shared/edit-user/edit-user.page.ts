import { Component, effect, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { UsersSignalStore } from '../../../signal_stores/users.signal.store';
import { UsersService } from '../../../services/users/users.service';
import { CommonButtonComponent } from '../common-button/common-button.component';
import { FormInputComponent } from '../form-input/form-input.component';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.page.html',
  styleUrls: ['../../../../styles/styles.css'],
  imports: [ReactiveFormsModule, FormInputComponent, CommonButtonComponent, TranslatePipe],
  standalone: true,
  inputs: ['closeOnSave'],
  outputs: ['saved', 'cancel'],
})
export class EditUserPage {
  @Input() closeOnSave = false;
  @Output() saved = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  editForm: FormGroup;
  submitting = false;
  labels: any = {};

  constructor(
    private fb: FormBuilder,
    public usersStore: UsersSignalStore,
    private usersService: UsersService,
    private router: Router,
  ) {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      surnames: ['', [Validators.required, Validators.maxLength(100)]],
      username: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(50)]],
      phoneNumber: [''],
      playerTag: [{ value: '', disabled: true }],
    });

    // reactively populate form when user is available
    effect(() => {
      const u = this.usersStore.user();
      if (u) {
        this.editForm.patchValue({
          name: u.name ?? '',
          surnames: u.surnames ?? '',
          username: u.username ?? '',
          email: u.email ?? '',
          phoneNumber: u.phoneNumber ?? '',
          playerTag: u.playerTag ?? '',
        });
      }
    });
  }

  onSubmit(e: Event) {
    e.preventDefault();
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const current = this.usersStore.user();
    if (!current) return;

    const payload = {
      ...current,
      name: this.editForm.value.name,
      surnames: this.editForm.value.surnames,
      username: this.editForm.value.username,
      email: this.editForm.value.email,
      phoneNumber: this.editForm.value.phoneNumber,
      // do not include playerTag to allow backend to keep it unchanged
    };

    this.submitting = true;
    this.usersService.editUser(String(current.id), payload).subscribe({
      next: (res) => {
        this.usersStore.setUser(res);
        // Si se usa dentro de un modal, emitir evento para que el padre cierre el modal
        if (this.closeOnSave) {
          this.saved.emit();
        } else {
          this.router.navigate(['/profile']).then(() => {});
        }
      },
      error: (err) => {
        console.error('Error updating user', err);
        this.submitting = false;
      },
      complete: () => {
        this.submitting = false;
      },
    });
  }

  onCancel(): void {
    if (this.closeOnSave) {
      this.cancel.emit();
    } else {
      this.router.navigate(['/profile']).then(() => {});
    }
  }
}
