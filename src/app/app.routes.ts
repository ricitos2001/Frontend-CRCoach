import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  {
    path: 'landing',
    loadChildren: () => import('./pages/landing/landing-module').then((m) => m.LandingModule),
    data: { title: 'Landing', breadcrumb: 'Landing' },
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login-module').then((m) => m.LoginModule),
    data: { title: 'Login', breadcrumb: 'Login' },
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register-module').then((m) => m.RegisterModule),
    data: { title: 'Register', breadcrumb: 'Register' },
  },
  {
    path: 'recover-password',
    loadChildren: () =>
      import('./pages/recover-password/recover-password-module').then(
        (m) => m.RecoverPasswordModule,
      ),
    data: { title: 'Recover password', breadcrumb: 'Recover password' },
  },
  {
    path: 'link-player-profile',
    loadChildren: () =>
      import('./pages/link-player-profile/link-player-profile-module').then(
        (m) => m.LinkPlayerProfileModule,
      ),
    data: { title: 'Link player profile', breadcrumb: 'Link player profile' },
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard-module').then((m) => m.DashboardModule),
    data: { title: 'Dashboard', breadcrumb: 'Dashboard' },
  },
  {
    path: 'battles',
    loadChildren: () => import('./pages/battles/battles-module').then((m) => m.BattlesModule),
    data: { title: 'Battle log', breadcrumb: 'Battle log' },
  },
  {
    path: 'weaknesses',
    loadChildren: () =>
      import('./pages/weaknesses/weaknesses-module').then((m) => m.WeaknessesModule),
    data: { title: 'Weaknesses diagnostic', breadcrumb: 'Weaknesses diagnostic' },
  },
  {
    path: 'goals',
    loadChildren: () => import('./pages/goals/goals-module').then((m) => m.GoalsModule),
    data: { title: 'Gaol list', breadcrumb: 'Goal list' },
  },
  {
    path: 'sessions',
    loadChildren: () => import('./pages/sessions/sessions-module').then((m) => m.SessionsModule),
    data: { title: 'Sessions diary', breadcrumb: 'Sessions diary' },
  },
  {
    path: 'progress',
    loadChildren: () => import('./pages/progress/progress-module').then((m) => m.ProgressModule),
    data: { title: 'Player progress', breadcrumb: 'Player progress' },
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile-module').then((m) => m.ProfileModule),
    data: { title: 'User profile', breadcrumb: 'User profile' },
  },
  {
    path: '**',
    loadChildren: () => import('./pages/not-found/not-found-module').then((m) => m.NotFoundModule),
    data: { title: 'Not found', breadcrumb: 'Not found' },
  },
];
