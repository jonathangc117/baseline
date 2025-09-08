import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [GuestGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'my-matches',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'add',
        loadComponent: () => import('./pages/my-matches/add-match/add-match.component').then(m => m.AddMatchComponent)
      },
      {
        path: 'singles',
        loadComponent: () => import('./pages/my-matches/singles-matches/singles-matches.component').then(m => m.SinglesMatchesComponent)
      },
      {
        path: 'doubles',
        loadComponent: () => import('./pages/my-matches/doubles-matches/doubles-matches.component').then(m => m.DoublesMatchesComponent)
      },
      {
        path: '',
        redirectTo: 'singles',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'my-profile',
    loadComponent: () => import('./pages/my-profile/my-profile.component').then(m => m.MyProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'stats',
    loadComponent: () => import('./pages/stats/stats.component').then(m => m.StatsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'players',
    loadComponent: () => import('./pages/players/players.component').then(m => m.PlayersComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];
