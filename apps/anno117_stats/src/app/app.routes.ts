import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  // {
  //   path: 'about',
  //   // Replace with your actual AboutComponent
  //   loadComponent: () => import('./pages/about/about.component').then(c => c.AboutComponent),
  //   title: 'About'
  // },
  {
    path: 'achievements',
    loadComponent: () =>
      import('@anno/achievements-ui').then((c) => c.AchievementPageComponent),
  },
  {
    path: 'city-status',
    loadComponent: () =>
      import('@anno/city-status-ui').then((m) => m.CityStatusPageComponent),
  },
  {
    path: 'ornaments',
    loadComponent: () =>
      import('./pages/ornaments/ornaments.component').then(
        (c) => c.OrnamentsPageComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
