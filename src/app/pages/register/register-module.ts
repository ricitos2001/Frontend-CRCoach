import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', loadComponent: () => import('./register.page').then((m) => m.RegisterPage), data: { title: 'Register', breadcrumb: 'Register' }, },
    ]),
  ],
})
export class RegisterModule {}
