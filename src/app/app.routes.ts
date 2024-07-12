import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { OaktrackerComponent } from './pokemon/oaktracker/oaktracker.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'pokemon/oaktracker', component: OaktrackerComponent },
    {
        path: 'old-site',
        loadComponent: () => import('./legacy/legacy.component').then(m => m.LegacyComponent)
    },
    { path: '**', redirectTo: 'home'},
];
