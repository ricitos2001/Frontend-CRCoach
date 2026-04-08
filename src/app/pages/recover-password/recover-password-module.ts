import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', loadComponent: () => import('./recover-password.page').then((m) => m.RecoverPasswordPage), data: { title: 'Recover password', breadcrumb: 'Recover password' }, },
    ]),
  ],
})
export class RecoverPasswordModule {}
