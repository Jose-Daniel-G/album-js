import { Component } from '@angular/core';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html'
})
export class IndexComponent {
  profesores = [
    {
      id_persona: 1,
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan.perez@example.com',
      telefono: '123456789',
      especialidad: 'Matemáticas',
      fecha_contratacion: '2020-01-15'
    },
    {
      id_persona: 2,
      nombre: 'Ana',
      apellido: 'García',
      email: 'ana.garcia@example.com',
      telefono: '987654321',
      especialidad: 'Historia',
      fecha_contratacion: '2019-09-10'
    }
    // Puedes agregar más datos
  ];

  currentPage = 1;
  itemsPerPage = 10;

  get paginatedProfesores() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.profesores.slice(start, start + this.itemsPerPage);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  eliminarProfesor(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este profesor?')) {
      this.profesores = this.profesores.filter(p => p.id_persona !== id);
    }
  }
}
