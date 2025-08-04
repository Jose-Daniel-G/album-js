import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-profesor-edit',
  templateUrl: './edit.component.html',
})
export class EditComponent implements OnInit {
  profesorId!: number;
  profesor = {
    id_persona: 0,
    nombre: '',
    apellido: '',
    fecha_nacimiento: '',
    email: '',
    telefono: '',
    especialidad: '',
    fecha_contratacion: '',
  };

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.profesorId = Number(this.route.snapshot.paramMap.get('id'));
    const profesorEncontrado = this.obtenerProfesorPorId(this.profesorId);

    if (profesorEncontrado) {
      this.profesor = { ...profesorEncontrado };
    } else {
      alert('Profesor no encontrado');
      this.router.navigate(['/profesores']);
    }
  }

  obtenerProfesorPorId(id: number) {
    const profesores = [
      {
        id_persona: 1,
        nombre: 'Andrés',
        apellido: 'Salazar',
        fecha_nacimiento: '1980-06-22',
        email: 'andres.salazar@example.com',
        telefono: '111222333',
        especialidad: 'Matemáticas',
        fecha_contratacion: '2020-08-01',
      },
      {
        id_persona: 2,
        nombre: 'Diana',
        apellido: 'Rojas',
        fecha_nacimiento: '1978-09-15',
        email: 'diana.rojas@example.com',
        telefono: '444555666',
        especialidad: 'Historia',
        fecha_contratacion: '2019-03-15',
      },
    ];
    return profesores.find(p => p.id_persona === id);
  }

  guardarCambios(): void {
    console.log('Profesor actualizado:', this.profesor);
    this.router.navigate(['/profesores']);
  }
}
