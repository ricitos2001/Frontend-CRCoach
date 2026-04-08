import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', loadComponent: () => import('./link-player-profile.page').then((m) => m.LinkPlayerProfilePage), data: { title: 'Link player profile', breadcrumb: 'Link player profile' }, },
    ]),
  ],
})
export class LinkPlayerProfileModule {}
