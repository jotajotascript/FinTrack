import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth-module').then(m => m.AUTH_ROUTES)
  },

  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },

  {
    path: 'receitas',
    loadComponent: () => import('./features/receitas/receitas.component').then(m => m.ReceitasComponent),
    canActivate: [authGuard]
  },

  {
    path: 'categorias',
    loadChildren: () => import('./features/categorias/categorias-module').then(m => m.CategoriasModule),
    canActivate: [authGuard]
  },

  {
    path: 'usuario',
    loadChildren: () => import('./features/usuario/usuario-module').then(m => m.UsuarioModule),
    canActivate: [authGuard]
  },
  
  { path: '**', redirectTo: 'dashboard' }
];