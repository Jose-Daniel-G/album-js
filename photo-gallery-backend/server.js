// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const fs = require('fs');
// Habilitar CORS (para que Angular pueda hacer peticiones)
app.use(cors());

// Carpeta donde se guardarán las imágenes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configurar almacenamiento de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.toLowerCase();
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Endpoint para subir imágenes
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});
// delete pictures
app.delete('/delete/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  console.log('Intentando borrar:', filePath);
  console.log('¿Existe el archivo?', fs.existsSync(filePath));
  fs.unlink(filePath, (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // El archivo no existe
        console.warn('Archivo no encontrado para borrar:', filename);
        return res.status(404).json({ message: 'Archivo no encontrado' });
      }
      console.error('Error al borrar archivo:', err);
      return res.status(500).json({ message: 'Error al borrar archivo' });
    }

    res.json({ message: 'Archivo eliminado correctamente' });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
