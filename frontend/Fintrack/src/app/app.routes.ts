import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [

  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth-module').then(m => m.AuthModule)
  },

  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard-module').then(m => m.DashboardModule),
    canActivate: [authGuard]
  },

{
  path: 'receitas',

  loadComponent: () =>
    import('./features/receitas/receitas.component')
      .then(m => m.ReceitasComponent)
},

 {

  path: 'despesas',
  loadComponent: () =>
    import('./features/despesas/despesas.component').then(m => m.DespesasComponent),
},
{
  path: 'crud-despesas',
  loadComponent: () =>
    import('./features/despesas/crud-despesas.component').then(m => m.CrudDespesasComponent),
},

  {
    path: 'categorias',
    loadChildren: () =>
      import('./features/categorias/categorias-module').then(m => m.CategoriasModule),
  
  },

  {
    path: 'usuario',
    loadChildren: () =>
      import('./features/usuario/usuario-module').then(m => m.UsuarioModule),
    canActivate: [authGuard]
  },

{
  path: 'auth/login',
  loadComponent: () =>
    import('./features/auth/login/login.component')
      .then(m => m.LoginComponent)
}
,
{
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register/register.component')
        .then(m => m.RegisterComponent)
  },

  
{ path: '**', redirectTo: 'dashboard' }
,




];

 

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}