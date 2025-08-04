import { Component } from '@angular/core';
import { GalleryComponent } from './components/gallery/gallery.component';

@Component({
  selector: 'app-root',
  imports: [GalleryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'photo-album-app';
}
