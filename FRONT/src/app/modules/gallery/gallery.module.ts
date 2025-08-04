import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesitas CommonModule para directivas como *ngIf, *ngFor
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GalleryRoutingModule } from './gallery-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { GalleryComponent } from './index/gallery.component';
import { PhotoCardComponent } from '../../shared/components/photo-card/photo-card.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
// import { HttpClientModule } from '@angular/common/http'; // ¡Importa HttpClientModule aquí!

@NgModule({
  declarations: [
    GalleryComponent,
  ],
  imports: [
    CommonModule, // Necesario para directivas estructurales (ngIf, ngFor)
    GalleryRoutingModule, PhotoCardComponent,
    ReactiveFormsModule,
    SharedModule,
    FormsModule, ModalComponent
    // HttpClientModule // Cada módulo que use HttpClient necesita importarlo
  ],
  exports: [
    // FormularioComponent // Exporta el componente para que pueda ser usado por otros módulos
  ],
})
export class GalleryModule {}
