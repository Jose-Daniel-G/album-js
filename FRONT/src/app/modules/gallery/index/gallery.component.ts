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
  folders: string[] = []; // inicial
  currentFolder: string = '';
  images: any[] = [];
  selectedPhoto: any | null = null;
  showModal = false;

  constructor(private galleryService: GalleryService) {}

ngOnInit(): void {
  this.galleryService.getFolders().subscribe((folders) => {
    this.folders = folders.sort(); // ahora incluirá rutas como "padre/hija"
    console.log('📁 Todas las carpetas:', this.folders); // <- imprime esto
    this.currentFolder = '';
  });
}


loadImages(): void {
  console.log('Cargando imágenes de:', this.currentFolder);
  this.galleryService.getImages(this.currentFolder).subscribe(
    (images) => {
      this.images = images.filter(img =>
        /\.(jpg|jpeg|png|gif|webp)$/i.test(img.url)  // ⚠️ o usa `img.filename` si es lo que tienes
      );
      console.log('Imágenes cargadas:', this.images);
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

    const fullPath = this.currentFolder ? `${this.currentFolder}/${newName}` : newName;

    this.galleryService.createFolder(fullPath).subscribe({
      next: () => {
        this.currentFolder = fullPath;
        this.loadFolders(); // 🔁 Refresca la lista de carpetas desde el backend
        this.loadImages();  // 🔁 Carga imágenes si se desea mostrar contenido de la nueva carpeta
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
    const root = this.folders.filter(f => !f.includes('/'));
    console.log('🌳 Carpetas raíz:', root); // 👈 AÑADE ESTO
    return root;
  }

  const prefix = this.currentFolder + '/';

  const visibles = this.folders
    .filter(f => f.startsWith(prefix) && f !== this.currentFolder)
    .map(f => {
      const sub = f.slice(prefix.length);
      return sub.includes('/') ? sub.split('/')[0] : sub;
    })
    .filter((v, i, a) => a.indexOf(v) === i);

  console.log('📂 Subcarpetas visibles en', this.currentFolder, ':', visibles); // 👈 AÑADE ESTO
  return visibles;
}


  onFolderClick(folder: string): void {
    this.currentFolder = this.currentFolder? `${this.currentFolder}/${folder}`: folder;

    this.images = []; // 🔥 Limpiar imágenes anteriores
    this.loadImages(); // 📦 Cargar imágenes de la nueva carpeta
    this.loadFolders(); // 🔁 Refrescar lista de carpetas
  }


onFileSelected(event: any): void {
  const file: File = event.target.files[0];
  if (!file) return;

  const folderPath = this.currentFolder || ''; // ejemplo: "sub1/sub2"

  this.galleryService.uploadImage(folderPath, file).subscribe({
    next: (response) => {
      const newImage = {
        url: response.url,
        filename: response.filename,
      };
      this.images.unshift(newImage);
      event.target.value = ''; // permite volver a subir el mismo archivo
    },
    error: (err) => {
      console.error('❌ Error al subir imagen:', err);
    }
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
    this.loadFolders(); 
  }
  loadFolders(): void {
    this.galleryService.getFolders().subscribe((folders) => {
      this.folders = folders.sort();
      console.log('📁 Todas las carpetas (loadFolders):', this.folders); // 👈 AÑADE ESTO
    });
  }

}
