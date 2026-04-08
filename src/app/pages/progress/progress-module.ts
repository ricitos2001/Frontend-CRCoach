import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', loadComponent: () => import('./progress.page').then((m) => m.ProgressPage), data: { title: 'Player progress', breadcrumb: 'Player progress' }, },
    ]),
  ],
})
export class ProgressModule {}
