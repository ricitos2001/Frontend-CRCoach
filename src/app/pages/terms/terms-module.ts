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
        loadComponent: () => import('./terms.page').then((m) => m.TermsPage),
        data: { title: 'Terms and conditions', breadcrumb: 'Terms and conditions' },
      },
    ]),
  ],
})
export class TermsModule {}
