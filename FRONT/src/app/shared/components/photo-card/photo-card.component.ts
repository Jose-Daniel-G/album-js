// src/app/components/photo-card/photo-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-photo-card',
  standalone: true, // Este componente es standalone
  templateUrl: './photo-card.component.html',
  styleUrls: ['./photo-card.component.css'],
})
export class PhotoCardComponent {
  @Input() img: any;
  @Output() photoSelected = new EventEmitter<any>();
  @Output() deletePhoto = new EventEmitter<any>();

  openModal() {
    this.photoSelected.emit(this.img);
  }
  
  onDeleteClick(event: Event) {
    event.stopPropagation(); // Para que no abra el modal
    this.deletePhoto.emit(this.img);
  }
}
