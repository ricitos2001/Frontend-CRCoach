import { Routes } from '@angular/router';
import { authGuard } from './guards/auth/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  {
    path: 'landing',
    loadChildren: () => import('./pages/landing/landing-module').then((m) => m.LandingModule),
    data: { title: 'Landing', breadcrumb: 'Landing' },
  },
  {
    path: 'terms',
    loadChildren: () => import("./pages/terms/terms-module").then((m) => m.TermsModule),
    data: { title: 'Terms and conditions', breadcrumb: 'Terms and conditions' },
  },
  {
    path: 'notice',
    loadChildren: () => import("./pages/notice/notice-module" ).then((m) => m.NoticeModule),
    data: { title: 'Legal notice', breadcrumb: 'Legal notice' },
  },
  {
    path: 'privacy',
    loadChildren: () => import("./pages/privacy/privacy-module").then((m) => m.PrivacyModule),
    data: { title: 'Privacy policy', breadcrumb: 'Privacy policy' },

  },
  {
    path: 'cookies',
    loadChildren: () => import("./pages/cookies/cookies-module").then((m) => m.CookiesModule),
    data: { title: 'Cookies information', breadcrumb: 'Cookies information' },

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
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/dashboard/dashboard-module').then((m) => m.DashboardModule),
    data: { title: 'Dashboard', breadcrumb: 'Dashboard', requireTag: true },
  },
  {
    path: 'battles',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/battles/battles-module').then((m) => m.BattlesModule),
    data: { title: 'Battle log', breadcrumb: 'Battle log' },
  },
  {
    path: 'weaknesses',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./pages/weaknesses/weaknesses-module').then((m) => m.WeaknessesModule),
    data: { title: 'Weaknesses diagnostic', breadcrumb: 'Weaknesses diagnostic' },
  },
  {
    path: 'goals',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/goals/goals-module').then((m) => m.GoalsModule),
    data: { title: 'Gaol list', breadcrumb: 'Goal list' },
  },
  {
    path: 'sessions',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/sessions/sessions-module').then((m) => m.SessionsModule),
    data: { title: 'Sessions diary', breadcrumb: 'Sessions diary' },
  },
  {
    path: 'progress',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/progress/progress-module').then((m) => m.ProgressModule),
    data: { title: 'Player progress', breadcrumb: 'Player progress' },
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/profile/profile-module').then((m) => m.ProfileModule),
    data: { title: 'User profile', breadcrumb: 'User profile' },
  },
  {
    path: '**',
    loadChildren: () => import('./pages/not-found/not-found-module').then((m) => m.NotFoundModule),
    data: { title: 'Not found', breadcrumb: 'Not found' },
  },
];
