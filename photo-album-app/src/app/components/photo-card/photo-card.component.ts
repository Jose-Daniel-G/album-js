// src/app/components/photo-card/photo-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-photo-card',
  templateUrl: './photo-card.component.html',
  styleUrls: ['./photo-card.component.css'],
})
export class PhotoCardComponent {
  @Input() photo: any;
  @Output() photoSelected = new EventEmitter<any>();
  @Output() deletePhoto = new EventEmitter<any>();

  openModal() {
    this.photoSelected.emit(this.photo);
  }
  
  onDeleteClick(event: Event) {
    event.stopPropagation(); // Para que no abra el modal
    this.deletePhoto.emit(this.photo);
  }
}
