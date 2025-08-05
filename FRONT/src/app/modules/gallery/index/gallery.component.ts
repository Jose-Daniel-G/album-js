// src/app/components/gallery/gallery.component.ts
import { Component, OnInit } from '@angular/core';
import { GalleryService } from '../../../services/gallery.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 👈 IMPORTANTE
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css'],
})
export class GalleryComponent implements OnInit {
  folders: string[] = ['default']; // inicial
  currentFolder: string = 'default';
  images: any[] = [];
  selectedPhoto: any | null = null;
  showModal = false;

  constructor(private galleryService: GalleryService) {}

ngOnInit(): void {
  this.galleryService.getFolders().subscribe((folders) => {
    this.folders = folders.sort(); // ahora incluirá rutas como "padre/hija"
    this.currentFolder = '';
  });
}


  loadImages(): void {
    console.log('Cargando imágenes de:', this.currentFolder);
    this.galleryService.getImages(this.currentFolder).subscribe(
      (images) => {
        this.images = images;
        console.log('Imágenes cargadas:', images);
      },
      (error) => {
        console.error('Error al cargar imágenes:', error);
      }
    );
  }

  onFolderChange(folder: string): void {
    this.currentFolder = folder;
    this.loadImages();
  }

  createFolder(): void {
    const newName = prompt('Nombre de la nueva carpeta:')?.trim();

    if (!newName) {
      alert('⚠️ El nombre de la carpeta no puede estar vacío.');
      return;
    }

    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(newName)) {
      alert('❌ El nombre de la carpeta contiene caracteres no permitidos.');
      return;
    }

    // Si estás en una carpeta actual, crea una subcarpeta
    const fullPath = this.currentFolder ? `${this.currentFolder}/${newName}` : newName;

    this.galleryService.createFolder(fullPath).subscribe({
      next: () => {
        if (!this.folders.includes(fullPath)) {
          this.folders.push(fullPath);
        }
        this.currentFolder = fullPath;
        this.loadImages();
        alert('✅ Carpeta creada correctamente');
      },
      error: (err) => {
        console.error('Error al crear carpeta:', err);
        alert('❌ No se pudo crear la carpeta.');
      }
    });
  }

  getVisibleFolders(): string[] {
    if (!this.currentFolder) {
      return this.folders.filter(f => !f.includes('/'));
    }

    const prefix = this.currentFolder + '/';

    return this.folders
      .filter(f => f.startsWith(prefix) && f !== this.currentFolder)
      .map(f => {
        const sub = f.slice(prefix.length);
        return sub.includes('/') ? sub.split('/')[0] : sub;
      })
      .filter((v, i, a) => a.indexOf(v) === i);
  }

  onFolderClick(folder: string): void {
    this.currentFolder = this.currentFolder ? `${this.currentFolder}/${folder}` : folder;
    console.log('Carpeta seleccionada:', this.currentFolder);

    this.loadImages();
  }


  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    this.galleryService
      .uploadImage(this.currentFolder, file)
      .subscribe((response) => {
        const newImage = {
          url: response.url,
          filename: response.filename,
        };
        this.images.unshift(newImage);
        event.target.value = ''; // para permitir reusar el mismo archivo
      });
  }
  deletePhoto(img: any): void {
    const filename = img.url.split('/').pop(); // Extrae nombre del archivo
    console.log('Deleting filename:', filename); // <-- AÑADE ESTO
    this.galleryService
      .deleteImage(this.currentFolder, filename)
      .subscribe(() => {
        // Elimina del arreglo
        this.images = this.images.filter((p) => p !== img); // Elimina de localStorage

        const uploadedPhotos = JSON.parse(
          localStorage.getItem('uploadedPhotos') || '[]'
        );
        const updatedPhotos = uploadedPhotos.filter(
          (p: any) => p.url !== img.url
        );
        localStorage.setItem('uploadedPhotos', JSON.stringify(updatedPhotos));
      });
  }
  openModal(img: any) {
    this.selectedPhoto = img;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedPhoto = null;
  }
  onBackToFolders(): void {
    this.currentFolder = '';
    this.images = [];
  }
}
