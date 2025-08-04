import { Component, OnInit } from '@angular/core';
import { PhotoService } from '../../services/photo.service';
import { PhotoCardComponent } from '../photo-card/photo-card.component'; // ¡Importación corregida!
import { ModalComponent } from '../modal/modal.component'; // ¡Importación corregida!
import { CommonModule } from '@angular/common'; // Necesario para la directiva *ngFor

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

  constructor(private photoService: PhotoService) {}

  ngOnInit(): void {
    this.photoService.getPhotos().subscribe((data) => {
      this.photos = data;
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
    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        const newPhoto = {
          id: this.photos.length + 1,
          url: reader.result as string,
          description: 'Imagen cargada localmente',
        };
        this.photos.unshift(newPhoto); // Agrega la imagen al inicio
      };

      reader.readAsDataURL(file); // Convierte el archivo en una URL base64
    }
  }
}
