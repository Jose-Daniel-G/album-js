import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule),
      },{
        path: 'gallery',
        loadChildren: () => import('./modules/gallery/gallery.module').then(m => m.GalleryModule),
      },
    ]
  },
  { path: '**', redirectTo: '/login' } // 🔹 Redirige cualquier otra URL inválida a login
];
