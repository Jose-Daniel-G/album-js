// src/app/components/gallery/gallery.component.ts
import { Component, OnInit } from '@angular/core';
import { GalleryService } from '../../services/gallery.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 👈 IMPORTANTE

@Component({
  selector: 'app-gallery',
  imports: [CommonModule, FormsModule, NgFor, NgIf],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css'],
})
export class GalleryComponent implements OnInit {
  folders: string[] = ['default']; // inicial
  currentFolder: string = 'default';
  images: any[] = [];

  constructor(private galleryService: GalleryService) {}

  ngOnInit(): void {
    this.galleryService.getFolders().subscribe((folders) => {
      this.folders = folders;
      // Selecciona la primera carpeta disponible o un valor vacío
      this.currentFolder = folders.length > 0 ? folders[0] : '';
      if (this.currentFolder) {
        this.loadImages();
      }
    });
  }

loadImages(): void {
  console.log('Cargando imágenes de:', this.currentFolder);
  this.galleryService.getImages(this.currentFolder).subscribe(images => {
    this.images = images;
    console.log('Imágenes cargadas:', images);
  }, error => {
    console.error('Error al cargar imágenes:', error);
  });
}

  onFolderChange(folder: string): void {
    this.currentFolder = folder;
    this.loadImages();
  }

  createFolder(): void {
    const folder = prompt('Nombre de la nueva carpeta:');
    if (folder) {
      this.galleryService.createFolder(folder).subscribe(() => {
        if (!this.folders.includes(folder)) {
          this.folders.push(folder);
        }
        this.currentFolder = folder;
        this.loadImages();
      });
    }
  }

  onFolderClick(folder: string): void {
    console.log('Carpeta seleccionada:', folder);
    this.currentFolder = folder;
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
}
