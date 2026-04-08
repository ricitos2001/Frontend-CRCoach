import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', loadComponent: () => import('./not-found.page').then((m) => m.NotFoundPage), data: { title: 'Not-found', breadcrumb: 'Not-found' }, },
    ]),
  ],
})
export class NotFoundModule {}
