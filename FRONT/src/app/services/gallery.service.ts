// src/app/services/gallery.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getImages(folder: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/images/${folder}`);
  }

  uploadImage(folder: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    console.log('Subiendo imagen a:', `${this.apiUrl}/upload/${folder}`);
    return this.http.post(`${this.apiUrl}/upload/${folder}`, formData);
  }

  createFolder(folder: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/folders`, { folder });
  }
  getFolders() {
    return this.http.get<string[]>(`${this.apiUrl}/folders`);
  }
  deleteImage(folder: string, filename: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${folder}/${filename}`);
  }

}
