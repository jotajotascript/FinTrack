import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './dashboard';

const routes: Routes = [
  { path: '', component: Dashboard }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    Dashboard,
  ],
})
export class DashboardModule {}