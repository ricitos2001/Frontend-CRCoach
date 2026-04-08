import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', loadComponent: () => import('./goals.page').then((m) => m.GoalsPage), data: { title: 'Goal list', breadcrumb: 'Goal list' }, },
    ]),
  ],
})
export class GoalsModule {}
