import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', loadComponent: () => import('./sessions.page').then((m) => m.SessionsPage), data: { title: 'Session diary', breadcrumb: 'Session diary' }, },
    ]),
  ],
})
export class SessionsModule {}
