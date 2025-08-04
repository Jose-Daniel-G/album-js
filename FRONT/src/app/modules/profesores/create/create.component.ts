import { Component } from '@angular/core';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html'
})
export class CreateComponent {
  profesor = {
    id_persona: 3,
    nombre: '',
    apellido: '',
    fecha_nacimiento: '',
    email: '',
    telefono: '',
    especialidad: '',
    fecha_contratacion: ''
  };

  guardar() {
    console.log('Profesor guardado:', this.profesor);
    // Aquí podrías llamar a un servicio para guardar la información
  }
}
