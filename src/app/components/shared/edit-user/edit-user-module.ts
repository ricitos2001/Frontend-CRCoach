import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', loadComponent: () => import('./edit-user.page').then((m) => m.EditUserPage), data: { title: 'Editar usuario', breadcrumb: 'Editar usuario' } },
    ]),
  ],
})
export class EditUserModule {}

