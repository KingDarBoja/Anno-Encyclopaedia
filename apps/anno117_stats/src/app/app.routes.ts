import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'achievements',
    loadComponent: () =>
      import('@anno/achievements-ui').then((c) => c.AchievementPageComponent),
  },
];
