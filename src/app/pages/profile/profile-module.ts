import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', loadComponent: () => import('./profile.page').then((m) => m.ProfilePage), data: { title: 'User profile', breadcrumb: 'User profile' }, },
    ]),
  ],
})
export class ProfileModule {}
