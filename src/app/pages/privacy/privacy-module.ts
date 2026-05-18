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
        loadComponent: () => import('./privacy.page').then((m) => m.PrivacyPage),
        data: { title: 'Privacy policy', breadcrumb: 'Privacy policy' },
      },
    ]),
  ],
})
export class PrivacyModule {}
