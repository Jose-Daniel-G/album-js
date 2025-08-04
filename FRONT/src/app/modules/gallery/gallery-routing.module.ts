// src/app/modules/roles/roles-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GalleryComponent } from './index/gallery.component';
// import { CreateComponent } from './create/create.component';
// import { EditComponent } from './edit/edit.component';

const routes: Routes = [
  { path: '', component: GalleryComponent }, // Assuming you have a list component
  // { path: 'create', component: CreateComponent },
  // { path: ':id/edit', component: EditComponent }, // Route for editing a role
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GalleryRoutingModule { }