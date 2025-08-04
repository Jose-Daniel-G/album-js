import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private uploadUrl = 'http://localhost:3000/upload';

  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<any>(this.uploadUrl, formData);
  }
  deleteImage(filename: string) {
    return this.http.delete(`http://localhost:3000/delete/${filename}`);
  }
}
