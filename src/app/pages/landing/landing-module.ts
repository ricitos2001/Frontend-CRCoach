import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', loadComponent: () => import('./landing.page').then((m) => m.LandingPage), data: { title: 'Landing', breadcrumb: 'Landing' }, },
    ]),
  ],
})
export class LandingModule {}
