import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', loadComponent: () => import('./battles.page').then((m) => m.BattlesPage), data: { title: 'Battle log', breadcrumb: 'Battle log' }, },
    ]),
  ],
})
export class BattlesModule {}
