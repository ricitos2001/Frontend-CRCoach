import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', loadComponent: () => import('./login.page').then((m) => m.LoginPage), data: { title: 'Login', breadcrumb: 'Login' }, },
    ]),
  ],
})
export class LoginModule {}
