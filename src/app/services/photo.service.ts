// src/app/services/photo.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  private photos = [
    { id: 1, url: 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', description: 'Atardecer en la playa' },
    { id: 2, url: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', description: 'Montañas nevadas' },
    { id: 3, url: 'https://images.pexels.com/photos/1031641/pexels-photo-1031641.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', description: 'Bosque en otoño' },
    { id: 4, url: 'https://images.pexels.com/photos/14841961/pexels-photo-14841961.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', description: 'Aventura en la ciudad' },
    { id: 5, url: 'https://images.pexels.com/photos/18449195/pexels-photo-18449195/free-photo-of-persona-sentada-en-un-banco-delante-de-un-lago.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', description: 'Paseo por el lago' },
    { id: 6, url: 'https://images.pexels.com/photos/15949583/pexels-photo-15949583/free-photo-of-persona-mirando-al-mar.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', description: 'Vistas al mar' },
  ];

  getPhotos(): Observable<any[]> {
    return of(this.photos);
  }
}