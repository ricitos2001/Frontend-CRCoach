import { Routes } from '@angular/router';

export const routes: Routes = [
  {path: '', redirectTo: 'landing', pathMatch: 'full'},
  {path: 'landing', loadChildren: () => import('./pages/landing/landing-module').then(m => m.LandingModule), data: { title: 'Landing', breadcrumb: 'Landing' }}
];
