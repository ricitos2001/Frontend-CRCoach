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
        loadComponent: () => import('./notice.page').then((m) => m.NoticePage),
        data: { title: 'Legal notice', breadcrumb: 'Legal notice' },
      },
    ]),
  ],
})
export class NoticeModule {}
