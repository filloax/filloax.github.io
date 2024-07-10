import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'old-site',
        loadComponent: () => import('./legacy/legacy.component').then(m => m.LegacyComponent)
    },
];
