import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
    title: 'Home',
    data: { description: 'Home of the Anno 117 Stats and Encyclopaedia' }
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
    title: 'Achievements',
    data: { description: 'List of Achievements in Anno 117' }
  },
  {
    path: 'city-status',
    loadComponent: () =>
      import('@anno/city-status-ui').then((m) => m.CityStatusPageComponent),
    title: 'City Status',
    data: { description: 'City Status Overview' }
  },
  {
    path: 'ornaments',
    loadComponent: () =>
      import('./pages/ornaments/ornaments.component').then(
        (c) => c.OrnamentsPageComponent,
      ),
    title: 'Ornaments',
    data: { description: 'Ornaments in Anno 117' }
  },
  {
    path: 'production-chains',
    loadComponent: () =>
      import(
        './pages/production-chain-visualizer/production-chain-visualizer.component'
      ).then((c) => c.ProductionChainVisualizerComponent),
    title: 'Production Chains',
    data: { description: 'Visualize Production Chains in Anno 117' }
  },
  {
    path: 'patrons',
    loadComponent: () =>
      import('./pages/patrons/patrons.component').then(
        (c) => c.PatronsPageComponent,
      ),
    title: 'Patrons',
    data: { description: 'Patrons of Anno 117' }
  },
  {
    path: 'atlas',
    children: [
      {
        path: 'fertility-sets',
        loadComponent: () =>
          import(
            './pages/atlas/fertility-sets-page/fertility-sets-page.component'
          ).then((c) => c.FertilitySetsPageComponent),
        title: 'Fertility Sets',
        data: { description: 'Fertility Sets in Anno 117 Atlas' }
      },
    ],
  },
  {
    path: 'specialists',
    loadComponent: () =>
      import('./pages/specialists/specialists.component').then(
        (c) => c.SpecialistsPageComponent,
      ),
    title: 'Specialists',
    data: { description: 'Specialists in Anno 117' }
  },
  {
    path: '**',
    redirectTo: '',
  },
];
