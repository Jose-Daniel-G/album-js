import { Component, OnInit } from '@angular/core';
import { PhotoService } from '../../services/photo.service';
import { PhotoCardComponent } from '../photo-card/photo-card.component'; // ¡Importación corregida!
import { ModalComponent } from '../modal/modal.component'; // ¡Importación corregida!
import { CommonModule } from '@angular/common'; // Necesario para la directiva *ngFor
import { UploadService } from '../../services/upload.service';

@Component({
  selector: 'app-gallery',
  standalone: true, // Asumimos que estás usando un componente standalone
  imports: [CommonModule, PhotoCardComponent, ModalComponent], // Importa los componentes que usas en su HTML
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css'],
})
export class GalleryComponent implements OnInit {
  photos: any[] = [];
  selectedPhoto: any | null = null;
  showModal = false;

  constructor(private photoService: PhotoService, private uploadService: UploadService) {}

  ngOnInit(): void {
  this.photoService.getPhotos().subscribe(data => {
    const uploadedPhotos = JSON.parse(localStorage.getItem('uploadedPhotos') || '[]');
    this.photos = [...uploadedPhotos, ...data];
  });
  }


  openModal(photo: any) {
    this.selectedPhoto = photo;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedPhoto = null;
  }
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    this.uploadService.uploadImage(file).subscribe(response => {
      console.log('Respuesta del servidor al subir imagen:', response);  // ← Agrega esto
      const newPhoto = {
        id: Date.now(),
        url: response.url,
        description: 'Imagen cargada por el usuario'
      };

      this.photos.unshift(newPhoto);

      // Guardar en localStorage como copia persistente (opcional)
      const savedPhotos = JSON.parse(localStorage.getItem('uploadedPhotos') || '[]');
      savedPhotos.unshift(newPhoto);
      localStorage.setItem('uploadedPhotos', JSON.stringify(savedPhotos));
    });
  }
  deletePhoto(photo: any): void {
    const filename = photo.url.split('/').pop(); // Extrae nombre del archivo
    console.log('Deleting filename:', filename); // <-- AÑADE ESTO
    this.uploadService.deleteImage(filename).subscribe(() => {
      // Elimina del arreglo
      this.photos = this.photos.filter((p) => p !== photo); // Elimina de localStorage

      const uploadedPhotos = JSON.parse(
        localStorage.getItem('uploadedPhotos') || '[]'
      );
      const updatedPhotos = uploadedPhotos.filter(
        (p: any) => p.url !== photo.url
      );
      localStorage.setItem('uploadedPhotos', JSON.stringify(updatedPhotos));
    });
  }
}
