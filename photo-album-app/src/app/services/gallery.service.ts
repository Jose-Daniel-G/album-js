// src/app/services/gallery.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private backendUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getImages(folder: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.backendUrl}/images/${folder}`);
  }

  uploadImage(folder: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post(`${this.backendUrl}/upload/${folder}`, formData);
  }

  createFolder(folder: string): Observable<any> {
    return this.http.post(`${this.backendUrl}/folders`, { folder });
  }
  getFolders() {
    return this.http.get<string[]>(`${this.backendUrl}/folders`);
  }
}
