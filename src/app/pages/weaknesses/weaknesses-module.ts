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
        loadComponent: () => import('./weaknesses.page').then((m) => m.WeaknessesPage),
        data: { title: 'Weaknesses diagnostic', breadcrumb: 'Weaknesses diagnostic' },
      },
    ]),
  ],
})
export class WeaknessesModule {}
