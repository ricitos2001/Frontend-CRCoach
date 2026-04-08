import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', loadComponent: () => import('./dashboard.page').then((m) => m.DashboardPage), data: { title: 'Dashboard', breadcrumb: 'Dashboard' }, },
    ]),
  ],
})
export class DashboardModule {}
