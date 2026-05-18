import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        loadComponent: () => import('./cookies.page').then((m) => m.CookiesPage),
        data: { title: 'Cookies information', breadcrumb: 'Cookies information' },
      },
    ]),
  ],
})
export class CookiesModule {}
